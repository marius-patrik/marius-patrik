// Opens (or updates) the pull request for bot/sync-workspace and lets it merge
// itself.
//
// There is no human gate here any more. A layout change -- a submodule added,
// removed, or relocated because a repository was archived, unarchived, made
// private or public -- merges unattended exactly like pointer movement does, so
// that a lifecycle operation closes its own loop without a manual follow-up.
//
// What replaced the gate is CI, not nothing. `Validate` is a required status
// check with strict branch protection, and verify-workspace.ts refuses to treat
// repositories the token cannot see as deletions. So the failure the gate used
// to catch by hand -- an under-installed App reporting a short repository list,
// which the sync would otherwise act on by deleting submodules -- now fails the
// required check and blocks the merge instead.
//
// STRUCTURAL is still read, but only to describe the diff accurately in the
// title and body. It no longer decides whether the pull request merges.
import {
  createPullRequest,
  enableAutoMerge,
  findOpenPullRequest,
  removeLabel,
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

  // Clear the label rather than set it: pull requests opened before the gate was
  // removed may still be carrying it, and a stale needs-review on a pull request
  // that merges itself reads as a contradiction.
  await removeLabel(OWNER, SELF, pullRequest.number, REVIEW_LABEL);
  await enableAutoMerge(OWNER, SELF, pullRequest.number);
  console.log(
    STRUCTURAL
      ? "Auto-merge enabled: this diff changes the workspace layout, and merges once Validate passes."
      : "Auto-merge enabled: pointer-only changes merge once the Validate check passes."
  );
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
      "> **Layout change.** This diff adds, removes, or relocates a submodule, which changes",
      "> the shape of the workspace. It merges unattended once `Validate` passes -- that check",
      "> re-derives the expected layout from the GitHub repository list and fails if this diff",
      "> is wrong, including when the App installation is under-installed.",
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