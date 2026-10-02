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

export function authToken() {
  const appToken = process.env.UMBRELA_APP_TOKEN?.trim();
  if (appToken) return appToken;
  const workflowToken = process.env.GITHUB_TOKEN?.trim();
  if (workflowToken) return workflowToken;
  // Local runs fall back to the credential gh already has, so the scripts are
  // runnable on a laptop without any environment setup.
  return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
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
      authorization: `Bearer ${authToken()}`,
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

// One page of the owner's repository list. Pagination is handled by listRepos
// so no caller ever has to think about per_page.
async function listReposPage(page) {
  return request(
    "GET",
    `/user/repos?per_page=100&page=${page}&affiliation=owner&sort=full_name`
  );
}

export async function listRepos() {
  const repos = [];
  for (let page = 1; ; page += 1) {
    const batch = await listReposPage(page);
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
      authorization: `Bearer ${authToken()}`,
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