// Single entry point for the repository lifecycle operations the umbrella owns:
// archive, unarchive, privatize, publicize, rename, and delete.
//
// These are all one endpoint -- PATCH /repos/{owner}/{repo} with a single field
// in the body -- except delete. Keeping them in one script rather than six
// workflows is what stops the six copies of that PATCH call from drifting apart.
//
// Every operation that changes visibility or lifecycle is followed by the same
// reconciliation the scheduled bot performs, because archiving a repository
// changes where it belongs in the workspace. The caller is expected to then open
// a pull request, which is gated on the diff being structural.
import { deleteRepo, getRepo, headSha, listRepos, patchRepo } from "./github-api.mjs";
import { expectedPath, removeGitlink } from "./repo-index.mjs";

const OWNER = process.env.UMBRELLA_OWNER?.trim() || "marius-patrik";
const SELF = process.env.UMBRELLA_REPO?.trim() || "marius-patrik";

const OPERATIONS = new Set([
  "archive",
  "unarchive",
  "privatize",
  "publicize",
  "rename",
  "delete"
]);

export class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

// The umbrella cannot be archived, renamed, hidden, or deleted by its own bot:
// every one of those would break the workspace that runs the bot. Checked before
// any API call so a refusal costs nothing.
function assertNotSelf(name) {
  if (name === SELF) {
    throw new Refusal(
      `refusing to operate on ${OWNER}/${SELF}: this is the umbrella repository that runs the sync and admin workflows`
    );
  }
}

async function requireRepo(name) {
  const repo = await getRepo(OWNER, name);
  if (!repo) throw new Refusal(`${OWNER}/${name} does not exist or is not visible to this token`);
  return repo;
}

async function archive(name) {
  assertNotSelf(name);
  const repo = await requireRepo(name);
  if (repo.archived) {
    console.log(`${name} is already archived.`);
    return { changed: false };
  }
  await patchRepo(OWNER, name, { archived: true });
  console.log(`archived ${name}`);
  console.log(`  it now belongs at ${expectedPath({ ...repo, archived: true })}`);
  return { changed: true };
}

async function unarchive(name) {
  assertNotSelf(name);
  const repo = await requireRepo(name);
  if (!repo.archived) {
    console.log(`${name} is already active.`);
    return { changed: false };
  }
  await patchRepo(OWNER, name, { archived: false });
  console.log(`unarchived ${name}`);
  console.log(`  it now belongs at ${expectedPath({ ...repo, archived: false })}`);
  return { changed: true };
}

async function privatize(name) {
  assertNotSelf(name);
  const repo = await requireRepo(name);
  if (repo.private) {
    console.log(`${name} is already private.`);
    return { changed: false };
  }

  // A fork's visibility is bound to its repository network, and GitHub will not
  // change one in isolation. Refusing with the reason beats a bare 422 later.
  if (repo.fork) {
    throw new Refusal(
      `${name} is a fork of ${repo.parent?.full_name ?? "another repository"}; ` +
        `GitHub cannot change a fork's visibility in isolation. Detach it from the network first, or rename the upstream instead.`
    );
  }

  if (repo.has_pages) {
    throw new Refusal(
      `${name} has GitHub Pages enabled; making it private will take the site down. ` +
        `Disable Pages first if that is intended.`
    );
  }

  console.warn(
    `warning: making ${name} private permanently erases its stars and watchers, ` +
      `disables push rulesets, and publishes nothing -- but a formerly public history becomes secret, not deleted.`
  );
  await patchRepo(OWNER, name, { private: true });
  console.log(`privatized ${name}`);
  console.log(`  it now belongs at ${expectedPath({ ...repo, private: true })}`);
  return { changed: true };
}

async function publicize(name) {
  assertNotSelf(name);
  const repo = await requireRepo(name);
  if (!repo.private) {
    console.log(`${name} is already public.`);
    return { changed: false };
  }
  console.warn(
    `warning: making ${name} public publishes its entire history, including every commit ` +
      `previously pushed to private forks. This cannot be undone.`
  );
  await patchRepo(OWNER, name, { private: false });
  console.log(`made ${name} public`);
  console.log(`  it now belongs at ${expectedPath({ ...repo, private: false })}`);
  return { changed: true };
}

async function rename(name, newName) {
  assertNotSelf(name);
  if (!newName) throw new Refusal("rename requires a new name");
  if (!/^[A-Za-z0-9._-]+$/.test(newName)) {
    throw new Refusal(`invalid repository name: ${newName}`);
  }
  const repo = await requireRepo(name);
  const collision = await getRepo(OWNER, newName);
  if (collision) throw new Refusal(`${OWNER}/${newName} already exists`);

  // Read the pin before the rename. Afterwards the old name 404s on the API even
  // though git redirects it, so the pointer has to be captured up front.
  const oldPath = expectedPath(repo);
  const sha = await headSha(OWNER, name, repo.default_branch);

  await patchRepo(OWNER, name, { name: newName });

  const renamed = await getRepo(OWNER, newName);
  console.log(`renamed ${name} -> ${newName}`);
  console.log(`  path moves from ${oldPath} to ${expectedPath(renamed)}`);
  if (sha) console.log(`  pinned at ${sha.slice(0, 7)}`);
  console.log(`  GitHub redirects the old clone URL; the sync bot re-points the submodule on its next run.`);
  return { changed: true };
}

async function remove(name, confirmName) {
  assertNotSelf(name);
  const repo = await getRepo(OWNER, name);
  if (!repo) {
    console.log(`${OWNER}/${name} does not exist.`);
    return { changed: false };
  }

  // Two deliberate steps. Archiving is reversible; deleting is not. Requiring
  // the archived state means a mistaken delete is always preceded by a state you
  // can go back to.
  if (!repo.archived) {
    throw new Refusal(
      `${name} is not archived. Run the archive operation first: deleting a live repository is ` +
        `unrecoverable, and archiving is the reversible step that comes before it.`
    );
  }

  if (confirmName !== name) {
    throw new Refusal(
      `confirmation does not match: pass confirm_name="${name}" exactly to delete ${OWNER}/${name}. ` +
        `Note that any local checkout with unpushed commits is not visible to this bot.`
    );
  }

  await deleteRepo(OWNER, name);
  console.log(`deleted ${OWNER}/${name}`);
  console.log(`  removing the workspace entry on the next sync`);
  return { changed: true, removed: expectedPath(repo) };
}

async function main() {
  const [operation, name, thirdArg] = process.argv.slice(2);

  if (!OPERATIONS.has(operation)) {
    console.error(`usage: node repo-admin.mjs <${[...OPERATIONS].join("|")}> <repo> [new-name|confirm-name]`);
    process.exit(2);
  }

  const runners = {
    archive: () => archive(name),
    unarchive: () => unarchive(name),
    privatize: () => privatize(name),
    publicize: () => publicize(name),
    rename: () => rename(name, thirdArg),
    delete: () => remove(name, thirdArg)
  };

  try {
    const result = await runners[operation]();
    if (result?.changed) {
      console.log(
        `\nWorkspace layout is now out of date. Run the Sync workspace workflow, then Open workspace PR: ` +
          `the change is structural, so that pull request will require review.`
      );
    }
  } catch (error) {
    if (error instanceof Refusal) {
      console.error(`refused: ${error.message}`);
      process.exit(1);
    }
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
}

main();