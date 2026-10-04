// Mints the installation token a job runs on, and in the same pass proves the App
// installation covers every repository.
//
// Why this exists instead of actions/create-github-app-token: the App already
// exists, and the repository already holds its id and private key. That action
// adds a third-party step to every workflow, currently logs a Node 20 deprecation
// warning on each run, and — more importantly — separates the two facts that
// must agree. The sync needs a token that sees the whole account *and* needs to
// know the account is fully covered. Minting both here makes it impossible for a
// job to prove completeness with one credential and then enumerate with another.
//
// The footgun this removes is concrete. `GITHUB_TOKEN` is repo-scoped: it sees
// exactly one repository, this one. If a workflow dropped the token and fell back
// to it, the enumeration would return a single repository, every real submodule
// would look absent, and — with completeness asserted separately — the sync would
// treat 65 live submodules as deletions. Binding the proof to the token means that
// combination cannot be constructed.
//
// Requested permissions come from argv as `name=level` pairs. They are a ceiling,
// not a grant: GitHub intersects them with what the App itself holds, so asking
// for more than the App has yields the App's level rather than an error.
//
// Usage:
//   node .github/scripts/mint-installation-token.ts [name=level ...]
//
// Writes to $GITHUB_OUTPUT when set:
//   token=<installation token>   complete=true|false
import { appCredentialsFromEnv, appJwt } from "./app-jwt.ts";

const OWNER = process.env.UMBRELLA_OWNER?.trim() || "marius-patrik";

interface Installation {
  id: number;
  account: { login: string };
  repository_selection: "all" | "selected";
}

interface AccessToken {
  token: string;
  expires_at: string;
}

async function api<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "marius-patrik-umbrella",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers
    }
  });

  const text = await response.text();
  if (!response.ok) {
    let detail = text.slice(0, 200);
    try {
      detail = (JSON.parse(text) as { message?: string }).message ?? detail;
    } catch {
      // Keep the raw body; a non-JSON error is more informative than a parse stub.
    }
    throw new Error(`${init.method ?? "GET"} ${path} failed with ${response.status}: ${detail}`);
  }
  return JSON.parse(text) as T;
}

function parsePermissions(argv: string[]): Record<string, string> | undefined {
  if (argv.length === 0) return undefined;
  const permissions: Record<string, string> = {};
  for (const pair of argv) {
    const index = pair.indexOf("=");
    if (index === -1) throw new Error(`expected name=level, got "${pair}"`);
    permissions[pair.slice(0, index)] = pair.slice(index + 1);
  }
  return permissions;
}

async function main(): Promise<void> {
  const permissions = parsePermissions(process.argv.slice(2));
  const jwt = appJwt(appCredentialsFromEnv());

  const installations = await api<Installation[]>("/app/installations", jwt);
  if (installations.length === 0) {
    throw new Error("the App has no installations, so it can see no repositories at all");
  }

  const target = installations.find((installation) => installation.account.login === OWNER);
  if (!target) {
    throw new Error(
      `the App is not installed on ${OWNER}; installations found: ` +
        installations.map((installation) => installation.account.login).join(", ")
    );
  }

  // The whole point of the assertion, and it has to happen before a token that
  // could act on an incomplete view is handed out.
  const complete = target.repository_selection === "all";
  console.log(
    `installation ${target.id} (${target.account.login}): ${target.repository_selection}` +
      `${complete ? "" : " -- NOT all repositories"}`
  );

  const minted = await api<AccessToken>(
    `/app/installations/${target.id}/access_tokens`,
    jwt,
    {
      method: "POST",
      body: JSON.stringify(permissions ? { permissions } : {})
    }
  );
  console.log(`installation token minted, expires ${minted.expires_at}`);
  for (const [name, level] of Object.entries(permissions ?? {})) {
    console.log(`  requested ${name}: ${level} (a ceiling; GitHub intersects with the App)`);
  }

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(process.env.GITHUB_OUTPUT, `token=${minted.token}\ncomplete=${complete}\n`);
  }

  if (!complete) {
    console.error(
      "\nerror: the App is not installed on all repositories. Widen it at " +
        "Settings -> Your Account -> Installations -> Configure -> All repositories. " +
        "A partial list must never be read as a set of deletions, so no token is handed on."
    );
    process.exit(1);
  }
}

main().catch((error: Error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});