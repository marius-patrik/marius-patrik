// Opens (or updates) the pull request for bot/sync-workspace and decides whether
// it may merge itself.
//
// The gate is the whole point of this script. Pointer movement is mechanical and
// safe to merge unattended. Anything that adds, removes, or relocates a submodule
// changes the shape of the workspace, and a new repository appearing or a
// deletion slipping through is exactly the kind of thing a human should see. So:
//
//   STRUCTURAL=false -> enable auto-merge, the PR merges when CI is green
//   STRUCTURAL=true  -> apply the needs-review label and stop
//
// Kept separate from the sync itself so the pull request can be reopened or its
// label adjusted without recomputing anything.
import {
  createPullRequest,
  enableAutoMerge,
  findOpenPullRequest,
  removeLabel,
  setLabels,
  updatePullRequest
} from "./github-api.ts";
import { REVIEW_LABEL, SYNC_BRANCH, git } from "./repo-index.ts";

const OWNER = process.env.UMBRELLA_OWNER?.trim() || "marius-patrik";
const SELF = process.env.UMBRELLA_REPO?.trim() || "marius-patrik";
const STRUCTURAL = process.env.STRUCTURAL === "true";

async function main(): Promise<void> {
  const commits = git("log", "--oneline", `${git("rev-parse", "origin/main").trim()}..${SYNC_BRANCH}`)
    .split(/\r?\n/)
    .filter(Boolean);

  if (commits.length === 0) {
    console.log(`${SYNC_BRANCH} has no commits ahead of main. Nothing to open.`);
    return;
  }

  const existing = await findOpenPullRequest(OWNER, SELF, `${OWNER}:${SYNC_BRANCH}`);
  let pullRequest = existing;
  if (pullRequest) {
    console.log(`Reusing pull request #${pullRequest.number}.`);
    // Re-point the existing description so it always reflects the current branch.
    await updatePullRequest(OWNER, SELF, pullRequest.number, { body: bodyFor(commits) });
  } else {
    pullRequest = await createPullRequest(OWNER, SELF, {
      title: titleFor(commits),
      body: bodyFor(commits),
      head: SYNC_BRANCH
    });
    console.log(`Opened pull request #${pullRequest.number}.`);
  }

  if (STRUCTURAL) {
    // Structural changes stay open. Auto-merge is deliberately not enabled even
    // if a previous run had enabled it on this pull request.
    await setLabels(OWNER, SELF, pullRequest.number, [REVIEW_LABEL]);
    console.log(
      `Labelled ${REVIEW_LABEL}: this diff changes the shape of the workspace, so it needs review before merging.`
    );
    return;
  }

  await removeLabel(OWNER, SELF, pullRequest.number, REVIEW_LABEL);
  await enableAutoMerge(OWNER, SELF, pullRequest.number);
  console.log("Auto-merge enabled: pointer-only changes merge once the Validate check passes.");
}

function titleFor(commits: string[]): string {
  const structural = commits.some((line) => line.includes("reconcile submodule layout"));
  return structural
    ? "chore(workspace): reconcile submodule layout with GitHub"
    : `chore(submodules): advance pointers to default branch heads (${commits.length} commit)`;
}

function bodyFor(commits: string[]): string {
  const lines = [
    "Opened by the `Sync workspace` workflow. Submodule pointers are derived from the",
    `GitHub repository list for \`${OWNER}\`; this pull request is regenerated every six hours.`,
    ""
  ];

  if (STRUCTURAL) {
    lines.push(
      "> **Needs review.** This diff adds, removes, or relocates a submodule, which changes",
      "> the shape of the workspace. Auto-merge is off until you merge it.",
      ""
    );
  } else {
    lines.push(
      "Pointer movement only. Auto-merge is enabled and will merge once CI is green,",
      "after which GitHub deletes the branch automatically.",
      ""
    );
  }

  lines.push("## Commits", "", ...commits.map((line) => `- ${line}`), "");
  lines.push(
    "Layout rule: archived repositories live under `_archive/`, active and private under",
    "`_private/`, active and public at the repository root.",
    ""
  );
  return lines.join("\n");
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});