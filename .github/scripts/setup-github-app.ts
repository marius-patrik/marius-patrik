#!/usr/bin/env node
// Verifies that the workflows' GitHub App credentials are in place, and reports
// what is missing.
//
// This does NOT create an App. The workflows authenticate with the existing
// `darkfactory-pipeline` App, which is shared with the DarkFactory delivery
// pipeline; creating a second App would mean two credentials with overlapping
// write access to the same repositories, which is strictly worse than one.
//
// Run this when a workflow fails at "Mint GitHub App installation token", or
// after changing the App's permissions.
//
// Usage: node .github/scripts/setup-github-app.ts

import { execFileSync } from "node:child_process";
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const OWNER = process.env.UMBRELLA_OWNER?.trim() || "marius-patrik";
const REPO = process.env.UMBRELLA_REPO?.trim() || "marius-patrik";
const APP_ID = "4861004";
const APP_SLUG = "darkfactory-pipeline";
const APP_NAME = "DarkFactory Pipeline";

// What each workflow needs, and why. administration:write is the one that
// matters for blast radius: it can delete any repository the App is installed on.
// Only Repo admin requests it; Sync workspace and CI mint read-only tokens.
// Keyed by the API's permission name, not the settings-URL slug. They differ:
// the settings page calls it "pull-requests", the API returns "pull_requests",
// and a check written against the slug silently reports a permission the App
// actually holds as missing.
const REQUIRED: { permission: string; usedBy: string; why: string }[] = [
  { permission: "contents:read", usedBy: "CI, Sync workspace", why: "resolve default branch SHAs" },
  { permission: "metadata:read", usedBy: "CI, Sync workspace, Repo admin", why: "list repositories, read archived/private" },
  { permission: "contents:write", usedBy: "Open workspace PR", why: "push the sync branch" },
  { permission: "pull_requests:write", usedBy: "Open workspace PR", why: "open PRs and enable auto-merge" },
  { permission: "administration:write", usedBy: "Repo admin", why: "archive, visibility, rename, delete" }
];

interface AppInfo {
  id: number;
  slug: string;
  name: string;
  permissions: Record<string, string>;
}

function jwt(privateKey: string): string {
  const base64url = (input: Buffer | string): string =>
    Buffer.from(input).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iat: now - 60, exp: now + 540, iss: Number(APP_ID) })
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(privateKey)
    .toString("base64url");

  return `${header}.${payload}.${signature}`;
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "marius-patrik-umbrella"
    }
  });
  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

async function main(): Promise<void> {
  const problems: string[] = [];

  // The App is identified by its numeric id, so the private key is the only way
  // to confirm which App it belongs to.
  let app: AppInfo | null = null;
  const key = readPrivateKey();

  if (key) {
    try {
      app = await fetchJson<AppInfo>(`https://api.github.com/app`, jwt(key));
      console.log(`App: ${app.name} (id ${app.id}, slug ${app.slug})`);
    } catch (error) {
      problems.push(
        `the private key does not authenticate as an App: ${(error as Error).message}. ` +
          `Is it the current key for ${APP_NAME}? A rotated key invalidates the old one.`
      );
    }
  } else {
    problems.push(
      "no private key found. Set APP_PRIVATE_KEY, or pass --key <path-to-pem> to check one."
    );
  }

  if (app && app.slug !== APP_SLUG) {
    problems.push(
      `the key belongs to "${app.slug}" (id ${app.id}), but the workflows expect ${APP_SLUG} (id ${APP_ID}). ` +
        `Re-point APP_ID at ${app.id}, or store the correct key.`
    );
  }

  if (app) {
    console.log("\nPermissions:");
    for (const requirement of REQUIRED) {
      const [name, level] = requirement.permission.split(":") as [string, "read" | "write"];
      const held = app.permissions[name] ?? "none";
      // "write" satisfies a "read" requirement: write implies read in GitHub's
      // permission model, and every permission the App holds is at least read.
      const satisfied = held === level || (level === "read" && held === "write");
      console.log(`  ${satisfied ? "ok  " : "MISS"} ${requirement.permission.padEnd(24)} ${requirement.why}`);
      if (!satisfied) {
        problems.push(
          `${APP_NAME} needs ${requirement.permission} for ${requirement.usedBy}; it currently has ` +
            `${name}:${held}. Grant it at https://github.com/settings/apps/${APP_SLUG}/permissions`
        );
      }
    }

    // Installation scope is the other half. An App with the right permissions but
    // installed on a subset returns a short repository list with no error, which
    // is the failure mode the sync explicitly refuses to act on.
    // The installations endpoint returns a bare array, not an object.
    const installations = await fetchJson<
      { id: number; repository_selection: string; account: { login: string } }[]
    >("https://api.github.com/app/installations", jwt(key as string));

    console.log(`\nInstallations: ${installations.length}`);
    for (const installation of installations) {
      // "all" means every current and future repository. "selected" is the
      // dangerous case: the token still works, it just cannot see the rest, and
      // the sync treats a short list as a deletion list unless it refuses.
      const scope = installation.repository_selection;
      const ok = scope === "all";
      console.log(`  ${ok ? "ok  " : "MISS"} ${installation.id} (${installation.account.login}): ${scope}`);
      if (!ok) {
        problems.push(
          `installation ${installation.id} covers only selected repositories. Widen it to all ` +
            `repositories at https://github.com/settings/installations/${installation.id}/repositories ` +
            `-- otherwise the sync sees a short list and refuses to run.`
        );
      }
    }
  }

  // Secrets are write-only, so they can only be checked by presence.
  const secrets = execFileSync("gh", ["secret", "list", "--repo", `${OWNER}/${REPO}`], {
    encoding: "utf8"
  });
  console.log("");
  for (const name of ["APP_ID", "APP_PRIVATE_KEY"]) {
    const present = secrets.includes(name);
    console.log(`  ${present ? "ok  " : "MISS"} secret ${name}`);
    if (!present) {
      problems.push(`secret ${name} is not set on ${OWNER}/${REPO}: gh secret set ${name} --repo ${OWNER}/${REPO}`);
    }
  }

  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log("\nAll App credentials are in place. Run the Sync workspace workflow to reconcile.");
}

function readPrivateKey(): string | null {
  const flagIndex = process.argv.indexOf("--key");
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return readFileSync(process.argv[flagIndex + 1], "utf8");
  }
  if (process.env.APP_PRIVATE_KEY) return process.env.APP_PRIVATE_KEY;
  return null;
}

main().catch((error: Error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});
