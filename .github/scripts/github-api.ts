// The only module that talks to the GitHub REST API. Every other script in this
// repository goes through here so that pagination, token selection, and error
// shaping have exactly one implementation.
//
// Token resolution: GITHUB_TOKEN is the workflow-provided installation token and
// can only see the umbrella repository. It cannot list the private repositories
// that make up most of this workspace, so UMBRELLA_APP_TOKEN (a GitHub App
// installation token minted from the darkfactory-pipeline App) is preferred when
// present.
import { execFileSync } from "node:child_process";

const API = "https://api.github.com";

// The fields this workspace derives its layout from. A full repository object is
// much larger and carries nested parents and owners that nothing here reads.
export interface Repo {
  name: string;
  archived: boolean;
  private: boolean;
  default_branch: string;
  fork: boolean;
  has_pages: boolean;
  size: number;
  created_at: string;
  pushed_at: string;
  parent: { full_name: string } | null;
  description: string | null;
}

// Which token is in use, and therefore which endpoints it is allowed to call.
export type CredentialSource = "installation" | "user";

export interface Credential {
  token: string;
  source: CredentialSource;
}

export interface PullRequestSummary {
  number: number;
  node_id: string;
  title: string;
  body: string | null;
}

export class GitHubError extends Error {
  status: number | undefined;
  body: unknown;

  constructor(message: string, options: { status?: number; body?: unknown } = {}) {
    super(message);
    this.name = "GitHubError";
    this.status = options.status;
    this.body = options.body;
  }
}

// Reads a token from the environment.
//
// `process.env.X` is the string "undefined" when X is unset, not undefined, so a
// plain truthiness check passes on a missing variable. The value is also
// whitespace-sensitive: a token arriving with surrounding whitespace trims to
// empty and would otherwise be sent to the API as an empty credential, which
// fails as a 401 rather than as "you forgot to set the variable".
//
// So this validates rather than trusts: a token must be a non-empty string after
// trimming, and must actually look like a GitHub token.
export function readToken(name: string): string | null {
  const raw: string | undefined = process.env[name];
  if (typeof raw !== "string") return null;

  const token = raw.trim();
  if (!token) return null;

  if (!/^(ghs_|ghp_|github_pat_)/.test(token)) {
    throw new Error(
      `${name} is set but is not a GitHub token (it starts with "${token.slice(0, 4)}"). ` +
        `Expected a token beginning ghs_, ghp_, or github_pat_.`
    );
  }
  return token;
}

// Resolves the credential and, with it, which enumeration endpoint is legal.
//
// This must be decided once and used consistently. An earlier version let
// `authToken()` silently fall back to `gh auth token` when UMBRELLA_APP_TOKEN was
// missing, so a run that believed it was using an installation token actually
// used a user token -- and a user token sees every repository, which defeats the
// under-installation guard entirely.
export function resolveCredential(): Credential {
  const appToken = readToken("UMBRELLA_APP_TOKEN");
  if (appToken) return { token: appToken, source: "installation" };

  const workflowToken = readToken("GITHUB_TOKEN");
  if (workflowToken) {
    // In Actions, GITHUB_TOKEN is also an installation token.
    return { token: workflowToken, source: "installation" };
  }

  // Local runs fall back to the credential gh already has. That is a
  // user-to-server token and sees every repository the user owns.
  try {
    const token = execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
    if (token) return { token, source: "user" };
  } catch {
    // Fall through to the explicit error below.
  }
  throw new Error(
    "No GitHub credential available. Set UMBRELLA_APP_TOKEN to a GitHub App installation " +
      "token, or run `gh auth login` to authenticate the gh CLI for local use."
  );
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

interface RequestOptions {
  body?: unknown;
  allow404?: boolean;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T | null> {
  const { body, allow404 = false } = options;

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
    const detail =
      (parsed as { message?: string } | null)?.message ?? text.slice(0, 200);
    throw new GitHubError(`${method} ${path} failed with ${response.status}: ${detail}`, {
      status: response.status,
      body: parsed
    });
  }
  return parsed as T;
}

// Two different endpoints are needed, and picking the wrong one fails silently in
// a way that looks like "the repositories do not exist".
//
//   A user-to-server token (PAT, or `gh auth token` locally) can call /user/repos
//   and enumerate every repository the user owns.
//
//   An installation token cannot. /user/repos is user-to-server only and returns
//   403 "Resource not accessible by integration". An installation must enumerate
//   through /installation/repositories, which returns only the repositories the
//   App is installed on -- a subset, silently, with no error.
//
// The distinction matters here: an App installed on a subset produces a short repo
// list rather than an error, and the sync would then treat every invisible
// repository as deleted. `source` is returned alongside the list so callers can
// detect an under-installed App instead of acting on a lie.
export async function listRepos(): Promise<{ repos: Repo[]; source: CredentialSource }> {
  const { source } = resolveCredential();
  if (source === "installation") {
    return { repos: await enumerateViaInstallation(), source };
  }
  return { repos: await enumerateViaUser(), source };
}

async function enumerateViaUser(): Promise<Repo[]> {
  const repos: Repo[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await request<Repo[]>(
      "GET",
      `/user/repos?per_page=100&page=${page}&affiliation=owner&sort=full_name`
    );
    if (!batch || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

async function enumerateViaInstallation(): Promise<Repo[]> {
  const repos: Repo[] = [];
  for (let page = 1; ; page += 1) {
    const response = await request<{ repositories: Repo[] }>(
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
export async function headSha(owner: string, repo: string, branch: string): Promise<string | null> {
  const commit = await request<{ sha: string }>(
    "GET",
    `/repos/${owner}/${repo}/commits/${encodeURIComponent(branch)}`
  );
  return commit?.sha ?? null;
}

export async function getRepo(owner: string, repo: string): Promise<Repo | null> {
  return request<Repo>("GET", `/repos/${owner}/${repo}`, { allow404: true });
}

// Archive, unarchive, visibility, and rename are all the same endpoint with a
// different single field in the body. Callers pass only what changes.
export async function patchRepo(
  owner: string,
  repo: string,
  fields: Partial<Pick<Repo, "name">> & { archived?: boolean; private?: boolean }
): Promise<Repo | null> {
  return request<Repo>("PATCH", `/repos/${owner}/${repo}`, { body: fields });
}

export async function deleteRepo(owner: string, repo: string): Promise<unknown> {
  return request("DELETE", `/repos/${owner}/${repo}`);
}

export async function findOpenPullRequest(
  owner: string,
  repo: string,
  head: string
): Promise<PullRequestSummary | null> {
  const query = new URLSearchParams({ state: "open", head, base: "main" });
  const pulls = await request<PullRequestSummary[]>("GET", `/repos/${owner}/${repo}/pulls?${query}`);
  return Array.isArray(pulls) && pulls.length > 0 ? pulls[0] : null;
}

export async function createPullRequest(
  owner: string,
  repo: string,
  options: { title: string; body: string; head: string; base?: string }
): Promise<PullRequestSummary> {
  const { title, body, head, base = "main" } = options;
  return request<PullRequestSummary>("POST", `/repos/${owner}/${repo}/pulls`, {
    body: { title, body, head, base }
  }) as Promise<PullRequestSummary>;
}

export async function updatePullRequest(
  owner: string,
  repo: string,
  pullNumber: number,
  fields: { title?: string; body?: string }
): Promise<unknown> {
  return request("PATCH", `/repos/${owner}/${repo}/pulls/${pullNumber}`, { body: fields });
}

// Auto-merge is GraphQL-only. It merges the pull request as soon as the required
// status checks pass, which is what keeps the sync unattended.
export async function enableAutoMerge(
  owner: string,
  repo: string,
  pullNumber: number,
  mergeMethod: "MERGE" | "SQUASH" | "REBASE" = "MERGE"
): Promise<void> {
  const query = `
    mutation EnableAutoMerge($pr: ID!, $method: PullRequestMergeMethod!) {
      enablePullRequestAutoMerge(input: { pullRequestId: $pr, mergeMethod: $method }) {
        clientMutationId
      }
    }
  `;
  const pull = await request<PullRequestSummary>("GET", `/repos/${owner}/${repo}/pulls/${pullNumber}`);
  if (!pull) throw new Error(`pull request #${pullNumber} not found in ${owner}/${repo}`);

  const response = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${resolveCredential().token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "marius-patrik-umbrella"
    },
    body: JSON.stringify({ query, variables: { pr: pull.node_id, method: mergeMethod } })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new GitHubError(`enableAutoMerge failed with ${response.status}: ${text.slice(0, 200)}`, {
      status: response.status
    });
  }
  const payload = safeParse(text) as { errors?: { message: string }[] } | null;
  if (payload?.errors?.length) {
    throw new GitHubError(`enableAutoMerge rejected: ${payload.errors[0].message}`);
  }
}

export async function deleteBranch(owner: string, repo: string, branch: string): Promise<unknown> {
  return request("DELETE", `/repos/${owner}/${repo}/git/refs/heads/${branch}`, { allow404: true });
}

export async function setLabels(
  owner: string,
  repo: string,
  pullNumber: number,
  labels: string[]
): Promise<unknown> {
  return request("POST", `/repos/${owner}/${repo}/issues/${pullNumber}/labels`, { body: { labels } });
}

export async function removeLabel(
  owner: string,
  repo: string,
  pullNumber: number,
  label: string
): Promise<unknown> {
  return request("DELETE", `/repos/${owner}/${repo}/issues/${pullNumber}/labels/${encodeURIComponent(label)}`, {
    allow404: true
  });
}