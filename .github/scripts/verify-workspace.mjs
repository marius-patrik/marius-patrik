// Read-only check of the umbrella workspace, run by CI on every push and pull
// request. It shares `repo-index.mjs` with the sync bot so the two cannot
// disagree about what the workspace is supposed to look like.
//
// It needs a token that can see private repositories. The workflow-provided
// GITHUB_TOKEN cannot (it 404s on `Study`), so CI mints a GitHub App
// installation token and passes it as UMBRELLA_APP_TOKEN.
import { headSha, listRepos } from "./github-api.mjs";
import { desiredState, diffWorkspace, expectedPath, readGitmodules, readGitlinks } from "./repo-index.mjs";

const OWNER = process.env.UMBRELLA_OWNER?.trim() || "marius-patrik";
const SELF = process.env.UMBRELLA_REPO?.trim() || "marius-patrik";

async function main() {
  const { repos: allRepos, source } = await listRepos();
  if (!allRepos.some((repo) => repo.name === SELF)) {
    console.error(
      source === "installation"
        ? `error: ${OWNER}/${SELF} is not visible to the App installation. An installation token ` +
          `sees only repositories the App is installed on.`
        : `error: cannot see ${OWNER}/${SELF}; the token in use cannot read this workspace`
    );
    process.exit(1);
  }

  const desired = desiredState(OWNER, allRepos, { selfName: SELF });
  const { structural, pointerDrift, tracked } = diffWorkspace(desired);

  // An under-installed App returns a short list rather than an error. Reporting
  // that as "these submodules should be deleted" would be a false accusation, so
  // say what is actually wrong instead.
  const visible = new Set(allRepos.map((repo) => repo.name));
  const invisible = [...readGitlinks().keys()]
    .map((path) => path.split("/").pop())
    .filter((name) => !visible.has(name));

  if (invisible.length > 0) {
    console.error(
      `error: the token cannot see ${invisible.length} tracked submodule(s) ` +
        `(${invisible.slice(0, 5).join(", ")}${invisible.length > 5 ? ", ..." : ""}).`
    );
    console.error(
      source === "installation"
        ? `  The App installation does not cover all repositories. Install it on all of them ` +
          `and this check will pass. Refusing to report these as deletions.`
        : `  The token in use cannot read these repositories.`
    );
    process.exit(1);
  }

  const problems = [];

  // Every discrepancy is reported with the expected value. A validator that only
  // says "mismatch" makes the reader derive the fix; one that says
  // "expected _private/Study" does not.
  for (const change of structural) {
    switch (change.kind) {
      case "missing-submodule":
        problems.push(`${change.path} is a GitHub repository but has no .gitmodules entry`);
        break;
      case "stale-submodule":
        problems.push(
          `${change.path} is declared in .gitmodules but ${OWNER}/${change.repo} no longer exists; ` +
            `run the sync workflow to remove it`
        );
        break;
      case "stale-gitlink":
        problems.push(`${change.path} is staged as a gitlink but is not a submodule of ${OWNER}/${SELF}`);
        break;
      case "missing-gitlink":
        problems.push(`${change.path} is declared in .gitmodules but has no gitlink staged`);
        break;
      case "wrong-url":
        problems.push(`${change.path}: url is ${change.actual}, expected ${change.expected}`);
        break;
      case "wrong-branch":
        problems.push(`${change.path}: branch is ${change.actual}, expected ${change.expected}`);
        break;
      case "wrong-update-mode":
        problems.push(`${change.path}: update is ${change.actual}, expected ${change.expected}`);
        break;
      default:
        problems.push(`${change.path}: ${change.kind}`);
    }
  }

  // Layout is derived from GitHub state, so it is worth stating explicitly even
  // when the path happens to be correct for the wrong reason.
  const gitlinks = readGitlinks();
  for (const repo of tracked) {
    const want = expectedPath(repo);
    const declared = readGitmodules().get(repo.name);
    if (declared && declared.path !== want) {
      problems.push(
        `${repo.name}: located at ${declared.path}, but ${repo.archived ? "archived" : repo.private ? "private" : "public"} ` +
          `repositories belong at ${want}`
      );
    }
    if (!gitlinks.has(want)) continue;
  }

  // Pointer freshness is reported but not fatal: the bot advances these on its
  // own schedule, and a failing check would race it. CI proves the workspace is
  // well-formed; the bot proves it is current.
  if (pointerDrift.length > 0) {
    const stale = [];
    for (const item of pointerDrift) {
      const head = await headSha(OWNER, item.repo, item.want.branch);
      if (head && head !== item.current) {
        stale.push(`  ${item.path}: ${item.current.slice(0, 7)} -> ${head.slice(0, 7)}`);
      }
    }
    if (stale.length > 0) {
      console.log(`${stale.length} pointer(s) behind their default branch head:`);
      for (const line of stale) console.log(line);
      console.log("These are advanced automatically by the sync workflow; no action needed.");
    }
  }

  if (problems.length > 0) {
    console.error(`\nerror: workspace does not match the ${OWNER} repository list (${problems.length} problem(s)):`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }

  const archived = tracked.filter((repo) => repo.archived).length;
  console.log(
    `Workspace verified: ${tracked.length} submodules (${archived} archived, ${tracked.length - archived} active) match the ${OWNER} repository list.`
  );
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});