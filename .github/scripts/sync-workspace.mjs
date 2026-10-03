// Reconciles the umbrella workspace with the GitHub repository list and pushes
// the result to a branch. This script never touches `main`: it commits to
// bot/sync-workspace, and the open-workspace-pr workflow decides whether that
// pull request may merge itself or must wait for review.
//
// Three commits, deliberately separated:
//   1. active layout      (Study relocated to _private/, any add/remove/relocate)
//   2. active pointers    (the repositories you actually work in)
//   3. archived pointers  (frozen history, high churn, low interest)
// Separating archive churn from real changes keeps the reviewable diff readable.
import { headSha, listRepos } from "./github-api.mjs";
import {
  SYNC_BRANCH,
  commit,
  desiredState,
  diffWorkspace,
  expectedPath,
  git,
  readGitlinks,
  removeGitlink,
  hasStagedChanges,
  splitPinsByArchived,
  stageGeneratedFiles,
  writeGitignore,
  writeGitlink,
  writeGitmodules
} from "./repo-index.mjs";

const OWNER = process.env.UMBRELLA_OWNER?.trim() || "marius-patrik";
const SELF = process.env.UMBRELLA_REPO?.trim() || "marius-patrik";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const { repos: allRepos, source } = await listRepos();
  if (!allRepos.some((repo) => repo.name === SELF)) {
    throw new Error(
      source === "installation"
        ? `${OWNER}/${SELF} is not visible to the App installation. An installation token sees ` +
          `only repositories the App is installed on; install it on all repositories and retry.`
        : `Cannot read ${OWNER}/${SELF} with the available token`
    );
  }

  // Checked before any diff is computed, because an incomplete repo list turns
  // every invisible repository into an apparent deletion. This is the one failure
  // mode of this script that destroys data rather than merely failing, so it is
  // asserted up front rather than as a post-hoc check.
  if (source === "installation") assertInstallationCoversSubmodules(allRepos);

  const desired = desiredState(OWNER, allRepos, { selfName: SELF });
  assertUmbrellaNotClassified(desired);

  const { structural, pointerDrift, tracked } = diffWorkspace(desired);

  console.log(
    `workspace: ${tracked.length} tracked repositories (via ${source} token), ` +
      `${structural.length} structural change(s), ${pointerDrift.length} pointer(s) to check`
  );

  // Build from the current main with a clean index, so every commit below is
  // computed from a known starting point and no leftover staging carries over.
  git("fetch", "--quiet", "origin", "main");
  git("checkout", "--quiet", "-B", SYNC_BRANCH, git("rev-parse", "origin/main").trim());
  git("reset", "--quiet");
  git("clean", "--quiet", "--force", "--", ".gitmodules", ".gitignore");

  const commits = [];

  // Each stage stages its own files, checks the index actually changed, commits,
  // then clears the index so the next stage starts from a clean base. Clearing
  // after the commit is what keeps the three commits from bleeding into each
  // other; `--dry-run` skips the commit so nothing is lost.
  const layout = applyLayout({ structural, tracked });
  if (layout.changed) {
    commits.push(
      record(`chore(workspace): reconcile submodule layout with GitHub (${layout.summary})`, dryRun)
    );
  }

  const { activePins, archivedPins } = splitPinsByArchived(pointerDrift);

  const activeAdvanced = await advancePointers(activePins, "active");
  if (activeAdvanced > 0) {
    commits.push(
      record(`chore(submodules): advance ${activeAdvanced} active pointer(s) to default branch heads`, dryRun)
    );
  }

  const archivedAdvanced = await advancePointers(archivedPins, "archived");
  if (archivedAdvanced > 0) {
    commits.push(
      record(
        `chore(submodules): advance ${archivedAdvanced} archived pointer(s) to default branch heads`,
        dryRun
      )
    );
  }

  if (commits.length === 0) {
    console.log("Workspace already matches GitHub. Nothing to do.");
    return { changed: false, structural: false };
  }

  console.log(`\n${commits.length} commit(s) ${dryRun ? "prepared" : "created"}:`);
  for (const message of commits) console.log(`  ${message}`);

  if (dryRun) {
    console.log(`\n--dry-run: nothing committed, nothing pushed.`);
    console.log(`${structural.length} structural change(s):`);
    for (const change of structural) {
      console.log(`  ${change.kind} ${change.path}${change.expected ? ` (expected ${change.expected})` : ""}`);
    }
    return { changed: true, structural: structural.length > 0, dryRun: true };
  }

  git("push", "--force-with-lease", "origin", `${SYNC_BRANCH}:${SYNC_BRANCH}`);
  console.log(`\nPushed to ${SYNC_BRANCH}.`);
  return { changed: true, structural: structural.length > 0 };
}

// The index knows every submodule the workspace tracks. If the token's repository
// list is missing one of them, the token cannot see that repository, and treating
// the omission as a deletion would remove a live submodule.
function assertInstallationCoversSubmodules(allRepos) {
  const visible = new Set(allRepos.map((repo) => repo.name));
  const invisible = [...readGitlinks().keys()]
    .map((path) => path.split("/").pop())
    .filter((name) => !visible.has(name));

  if (invisible.length > 0) {
    throw new Error(
      `The App installation cannot see ${invisible.length} tracked submodule(s), ` +
        `including ${invisible.slice(0, 5).join(", ")}${invisible.length > 5 ? ", ..." : ""}. ` +
        `The sync will not treat these as deleted. Install the App on all repositories ` +
        `(Settings -> Your Account -> Installations -> Configure -> All repositories) and retry.`
    );
  }
}

// The umbrella repository must never be classified as a submodule of itself, and
// must never appear in .gitmodules. If it somehow does, the next sync would write
// a self-referential gitlink that no clone can satisfy.
function assertUmbrellaNotClassified(desired) {
  if (desired.byPath.has(SELF)) {
    throw new Error(`${OWNER}/${SELF} was classified as its own submodule; refusing to write that`);
  }
}

// Rewrites .gitmodules and .gitignore from the GitHub list, then relocates
// gitlinks whose path changed. A move is force-remove of the old path plus a
// write of the new one, so relocating `Study` to `_private/Study` needs neither a
// checkout nor a clone.
function applyLayout({ structural, tracked }) {
  if (structural.length === 0) return { changed: false, summary: "" };

  const existing = readGitlinks();

  // Carry the pin across a move by repository name, not by path. Looking the SHA
  // up under the new path would find nothing and silently reset the pointer.
  const shaByName = new Map();
  for (const [path, sha] of existing) {
    shaByName.set(path.split("/").pop(), sha);
  }

  writeGitmodules(OWNER, tracked);
  writeGitignore(tracked);

  const notes = [];
  for (const change of structural) {
    switch (change.kind) {
      case "stale-gitlink":
      case "stale-submodule":
        removeGitlink(change.path);
        notes.push(`remove ${change.path}`);
        break;
      case "missing-gitlink": {
        const sha = shaByName.get(change.repo);
        if (sha) {
          writeGitlink(change.path, sha);
          notes.push(`place ${change.path}`);
        }
        break;
      }
      case "wrong-url":
        notes.push(`fix url ${change.path}`);
        break;
      case "wrong-branch":
        notes.push(`fix branch ${change.path}`);
        break;
      case "wrong-update-mode":
        notes.push(`fix update mode ${change.path}`);
        break;
      default:
        notes.push(`${change.kind} ${change.path}`);
    }
  }

  stageGeneratedFiles();
  return { changed: hasStagedChanges(), summary: notes.slice(0, 4).join(", ") };
}

// Every SHA comes from the API. Nothing is cloned, which is what makes advancing
// the archived pointers possible at all: they use `update = none`, are never
// checked out, and have no working tree to fetch into.
async function advancePointers(pins, label) {
  const writes = [];
  for (const item of pins) {
    const sha = await headSha(OWNER, item.repo, item.want.branch);
    if (!sha || sha === item.current) continue;
    writeGitlink(item.path, sha);
    writes.push(item.path);
    console.log(`  ${label}: ${item.path} ${item.current.slice(0, 7)} -> ${sha.slice(0, 7)}`);
  }
  // No `git add` here on purpose. Re-staging a submodule path makes git read the
  // on-disk checkout, which would replace the pointer with whatever happens to be
  // cloned locally and silently undo the advance.
  return writes.length;
}

function record(message, dryRun) {
  if (dryRun) {
    // Leave the working tree as the last stage left it, but drop it from the
    // index so a subsequent real run starts clean. A dry run must not leave the
    // repository staged.
    git("reset", "--quiet");
    return message;
  }
  return commit(message);
}

main()
  .then((result) => {
    // Machine-readable summary. The workflow captures these two lines as step
    // outputs to decide whether to open a pull request and whether that pull
    // request may merge itself.
    if (result?.changed && !result.dryRun) {
      console.log(`CHANGED=true`);
      console.log(`STRUCTURAL=${result.structural ? "true" : "false"}`);
    }
  })
  .catch((error) => {
    console.error(`error: ${error.message}`);
    process.exit(1);
  });