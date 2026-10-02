#!/usr/bin/env node
// One-time setup for the GitHub App the workflows authenticate with.
//
// Creates the App manifest, opens it in the browser so it can be registered, and
// prints the follow-up commands for installing it and storing the two secrets.
//
// Deliberately not automatic past the browser step: registering an App, choosing
// its permissions, and installing it on 64 repositories are all decisions a
// human should make deliberately, and the installation is what actually grants
// the access this repository depends on.
//
// Usage: node .github/scripts/setup-github-app.mjs [--json]

import { execFileSync } from "node:child_process";

const OWNER = process.env.UMBRELLA_OWNER?.trim() || "marius-patrik";
const APP_NAME = "marius-patrik-umbrella";

// The three permissions the workflows need, and nothing else:
//
//   metadata:read      list repositories and read their archived/private flags.
//                      This is what the classification rule is derived from.
//   contents:read      resolve each default branch head to a SHA. The sync reads
//                      64 SHAs per run and never clones.
//   administration:write  PATCH and DELETE /repos, used only by the Repo admin
//                      workflow. See the note on blast radius below.
const MANIFEST = {
  name: APP_NAME,
  url: `https://github.com/${OWNER}/${OWNER}`,
  hook_attributes: { url: "https://example.invalid/umbrella-hook" },
  redirect_url: "https://github.com",
  public: false,
  default_permissions: {
    contents: "read",
    metadata: "read",
    administration: "write"
  },
  default_events: []
};

function main() {
  // App registration is a browser flow. The manifest is turned into a URL that
  // pre-fills the registration form, so the only manual steps are naming
  // confirmation and generation of the private key.
  const manifest = Buffer.from(JSON.stringify(MANIFEST)).toString("base64");
  const url = `https://github.com/settings/apps/new?state=${encodeURIComponent(
    JSON.stringify({ manifest })
  )}`;

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(MANIFEST, null, 2));
    return;
  }

  console.log(`GitHub App manifest for "${APP_NAME}"\n`);
  console.log("Register the App:");
  console.log(`  ${url}\n`);
  console.log("Permissions requested (all three are used; none is speculative):");
  console.log("  contents:read         resolve default branch SHAs for the sync");
  console.log("  metadata:read         list repositories and read archived/private");
  console.log("  administration:write  archive, visibility, rename, delete\n");
  console.log("After registering, run the remaining steps:\n");
  console.log(`  1. Install the App on all repositories, including ${OWNER}/${OWNER}:`);
  console.log(
    `     gh api /user/installations --jq '.installations[] | select(.app_slug=="${APP_NAME}") | .id'`
  );
  console.log("     (or: Settings -> Your Account -> Installations -> Configure)\n");
  console.log("  2. Store the App ID as a secret:");
  console.log(`     gh secret set APP_ID --repo ${OWNER}/${OWNER}\n`);
  console.log("  3. Store the private key (.pem downloaded during registration) as a secret:");
  console.log(`     gh secret set APP_PRIVATE_KEY --repo ${OWNER}/${OWNER}\n`);
  console.log("Then enable the repository settings the auto-merge flow depends on:");
  console.log(
    `  gh api -X PATCH repos/${OWNER}/${OWNER} -F allow_auto_merge=true -F delete_branch_on_merge=true\n`
  );
  console.log("And protect main so the bot cannot bypass review:");
  console.log(
    `  gh api -X PUT repos/${OWNER}/${OWNER}/branches/main/protection --input - <<'EOF'\n` +
      "  {\n" +
      '    "required_status_checks": { "strict": true, "contexts": ["Validate"] },\n' +
      '    "enforce_admins": false,\n' +
      '    "required_pull_request_reviews": null,\n' +
      '    "restrictions": null\n' +
      "  }\n" +
      "  EOF\n"
  );
  console.log("Blast radius, stated plainly:");
  console.log(
    "  administration:write can delete any repository it is installed on. Only the\n" +
      "  Repo admin workflow is granted that permission; Sync workspace and CI mint\n" +
      "  read-only tokens. Installing the App on all 64 repositories is therefore the\n" +
      "  single decision that grants delete rights over all of them."
  );
}

// Fail loudly rather than silently shelling out if gh is unavailable.
try {
  execFileSync("gh", ["--version"], { stdio: "ignore" });
} catch {
  console.error("gh not found on PATH; install the GitHub CLI to continue");
  process.exit(1);
}

main();