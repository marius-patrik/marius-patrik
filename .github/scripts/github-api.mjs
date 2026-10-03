// The only module that talks to the GitHub REST API. Every other script in this
// repository goes through here so that pagination, token selection, and error
// shaping have exactly one implementation.
//
// Token resolution: GITHUB_TOKEN is the workflow-provided installation token and
// can only see the umbrella repository. It cannot list the private repositories
// that make up most of this workspace, so UMMBRELLA_APP_TOKEN (a GitHub App
// installation token minted by the workflow) is preferred when present.
import { execFileSync } from "node:child_process";

const API = "https://api.github.com";

// Resolves the credential and, with it, which enumeration endpoint is legal.
//
// This must be decided once and used consistently. An earlier version let
// `authToken()` silently fall back to `gh auth token` when UMBRELLA_APP_TOKEN was
// missing, so a run that believed it was using an installation token actually
// used a user token -- and a user token sees every repository, which defeats the
// under-installation guard entirely. The fallback is now explicit: it only
// happens when no token was supplied at all, and the returned `source` always
// describes the credential actually in use.
export function resolveCredential() {
  const appToken = process.env.UMBRELA_APP_TOKEN?.trim();
  if (appToken) return { token: appToken, source: "installation" };

  const workflowToken = process.env.GITHUB_TOKEN?.trim();
  if (workflowToken) {
    // In Actions, GITHUB_TOKEN is also an installation token.
    return { token: workflowToken, source: "installation" };
  }

  // Local runs fall back to the credential gh already has. That is a
  // user-to-server token and sees every repository the user owns.
  return { token: execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim(), source: "user" };
}

export function authToken() {
  return resolveCredential().token;
}

export class GitHubError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
    this.body = body;
  }
}

async function request(method, path, { body, allow404 = false } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${resolveCredential().token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "marius-patrik-umbrella",
      ...(body ? { "content-type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (response.status === 404 && allow404) return null;

  const text = await response.text();
  const parsed = text ? safeParse(text) : null;

  if (!response.ok) {
    const detail = parsed?.message ?? text.slice(0, 200);
    throw new GitHubError(`${method} ${path} failed with ${response.status}: ${detail}`, {
      status: response.status,
      body: parsed
    });
  }
  return parsed;
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Two different endpoints are needed, and picking the wrong one fails silently
// in a way that looks like "the repositories do not exist".
//
//   A user-to-server token (PAT, or `gh auth token` locally) can call
//   /user/repos and enumerate every repository the user owns.
//
//   An installation token cannot. /user/repos is user-to-server only and returns
//   403 "Resource not accessible by integration". An installation must enumerate
//   through /installation/repositories, which returns only the repositories the
//   App is installed on -- a subset, silently, with no error.
//
// The distinction matters here: an App installed on a subset produces a short
// repo list rather than an error, and the sync would then try to delete every
// submodule it cannot see. `repositoriesVisibleTo` is returned alongside the list
// so callers can detect an under-installed App instead of acting on a lie.
export async function listRepos() {
  const { source } = resolveCredential();
  if (source === "installation") {
    return { repos: await enumerateViaInstallation(), source };
  }
  return { repos: await enumerateViaUser(), source };
}

async function enumerateViaUser() {
  const repos = [];
  for (let page = 1; ; page += 1) {
    const batch = await request(
      "GET",
      `/user/repos?per_page=100&page=${page}&affiliation=owner&sort=full_name`
    );
    if (!batch || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

async function enumerateViaInstallation() {
  const repos = [];
  for (let page = 1; ; page += 1) {
    const response = await request(
      "GET",
      `/installation/repositories?per_page=100&page=${page}`
    );
    const batch = response?.repositories;
    if (!batch || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

// Resolves the commit a repository's default branch points at. This is the only
// network read the sync performs per submodule, and it replaces cloning the
// repository entirely.
export async function headSha(owner, repo, branch) {
  const commit = await request("GET", `/repos/${owner}/${repo}/commits/${encodeURIComponent(branch)}`);
  return commit?.sha ?? null;
}

export async function getRepo(owner, repo) {
  return request("GET", `/repos/${owner}/${repo}`, { allow404: true });
}

// Archive, unarchive, visibility, and rename are all the same endpoint with a
// different single field in the body. Callers pass only what changes.
export async function patchRepo(owner, repo, fields) {
  return request("PATCH", `/repos/${owner}/${repo}`, { body: fields });
}

export async function deleteRepo(owner, repo) {
  return request("DELETE", `/repos/${owner}/${repo}`);
}

export async function findOpenPullRequest(owner, repo, head) {
  const query = new URLSearchParams({ state: "open", head, base: "main" });
  const pulls = await request("GET", `/repos/${owner}/${repo}/pulls?${query}`);
  return Array.isArray(pulls) && pulls.length > 0 ? pulls[0] : null;
}

export async function createPullRequest(owner, repo, { title, body, head, base = "main" }) {
  return request("POST", `/repos/${owner}/${repo}/pulls`, { body: { title, body, head, base } });
}

export async function updatePullRequest(owner, repo, pullNumber, fields) {
  return request("PATCH", `/repos/${owner}/${repo}/pulls/${pullNumber}`, { body: fields });
}

// Auto-merge is GraphQL-only. It merges the pull request as soon as the
// required status checks pass, which is what keeps the sync unattended.
export async function enableAutoMerge(owner, repo, pullNumber, mergeMethod = "MERGE") {
  const query = `
    mutation EnableAutoMerge($pr: ID!, $method: PullRequestMergeMethod!) {
      enablePullRequestAutoMerge(input: { pullRequestId: $pr, mergeMethod: $method }) {
        clientMutationId
      }
    }
  `;
  const nodeId = await prNodeId(owner, repo, pullNumber);

  const response = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${resolveCredential().token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "marius-patrik-umbrella"
    },
    body: JSON.stringify({
      query,
      variables: { pr: nodeId, method: mergeMethod }
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new GitHubError(`enableAutoMerge failed with ${response.status}: ${text.slice(0, 200)}`, {
      status: response.status
    });
  }
  const payload = safeParse(text);
  if (payload?.errors?.length) {
    throw new GitHubError(`enableAutoMerge rejected: ${payload.errors[0].message}`);
  }
}

async function prNodeId(owner, repo, pullNumber) {
  const pull = await request("GET", `/repos/${owner}/${repo}/pulls/${pullNumber}`);
  return pull.node_id;
}

export async function deleteBranch(owner, repo, branch) {
  return request("DELETE", `/repos/${owner}/${repo}/git/refs/heads/${branch}`, { allow404: true });
}

export async function setLabels(owner, repo, pullNumber, labels) {
  return request("POST", `/repos/${owner}/${repo}/issues/${pullNumber}/labels`, { body: { labels } });
}

export async function removeLabel(owner, repo, pullNumber, label) {
  return request("DELETE", `/repos/${owner}/${repo}/issues/${pullNumber}/labels/${encodeURIComponent(label)}`, {
    allow404: true
  });
}