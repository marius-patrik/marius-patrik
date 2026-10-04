// The classification rule and the only code that writes `.gitmodules` or the
// gitlink index. Both the sync bot and the CI validator import this so that
// "where does this repository belong" can never be answered two different ways.
//
// The rule:
//   archived             -> _archive/<name>   (update = none, never fetched)
//   active and private   -> _private/<name>
//   active and public    -> <name>
//
// Pointers are written with `git update-index --cacheinfo` rather than
// `git submodule update`. That is deliberate and load-bearing: the archived
// submodules use `update = none` and are never cloned, so there is no working
// tree to fetch into. Writing the gitlink directly is the only way to advance
// them, and it means the sync never clones 64 repositories to move 64 pointers.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Repo } from "./github-api.ts";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const ARCHIVE_DIR = "_archive";
export const PRIVATE_DIR = "_private";
export const SYNC_BRANCH = "bot/sync-workspace";
export const REVIEW_LABEL = "needs-review";

// A single layout function. Everything else derives from it.
export function expectedPath(repo: Pick<Repo, "name" | "archived" | "private">): string {
  if (repo.archived) return `${ARCHIVE_DIR}/${repo.name}`;
  if (repo.private) return `${PRIVATE_DIR}/${repo.name}`;
  return repo.name;
}

export function expectedCloneUrl(owner: string, repoName: string): string {
  return `https://github.com/${owner}/${repoName}.git`;
}

// stderr is captured and rethrown with git's own message. execFileSync's default
// error text is only "Command failed: git ...", which names the failing command
// but not the reason -- and "reason" is the entire content of every git failure
// here. Diagnosing the archived-pointer commit took a dozen probe runs purely
// because this discarded the one useful line.
export function git(...args: string[]): string {
  try {
    return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" });
  } catch (error) {
    const failure = error as { stderr?: string; stdout?: string; status?: number };
    const detail = [failure.stderr, failure.stdout].filter(Boolean).join("").trim();
    throw new Error(
      `git ${args.join(" ")} failed${detail ? `: ${detail}` : ""}` +
        (failure.status ? ` (exit ${failure.status})` : "")
    );
  }
}

export function gitIn(dir: string, ...args: string[]): string {
  return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" });
}

// One stanza of .gitmodules. Every field is optional because a stanza is
// whatever the file currently says; a missing field is exactly what the
// structural diff is looking for.
export interface GitmoduleEntry {
  path?: string;
  url?: string;
  branch?: string;
  update?: string;
}

export type Gitmodules = Map<string, GitmoduleEntry>;

// Parses `.gitmodules` through `git config` rather than a hand-rolled INI
// reader, so quoting and ordering behave exactly as git itself sees them.
export function readGitmodules(): Gitmodules {
  const file = path.join(ROOT, ".gitmodules");
  if (!fs.existsSync(file)) return new Map();

  const entries: Gitmodules = new Map();
  let stdout: string;
  try {
    stdout = git("config", "--file", ".gitmodules", "--list");
  } catch {
    return entries;
  }

  for (const line of stdout.split(/\r?\n/)) {
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    const match = key.match(/^submodule\.(.+)\.(path|url|branch|update)$/);
    if (!match) continue;
    const [, name, field] = match as RegExpMatchArray & [string, string, keyof GitmoduleEntry];
    const entry = entries.get(name) ?? {};
    entry[field] = value;
    entries.set(name, entry);
  }
  return entries;
}

export function gitmodulesEntry(name: string, repo: Repo): Required<Pick<GitmoduleEntry, "path" | "url" | "branch">> & { update?: string } {
  const entry = {
    path: expectedPath(repo),
    url: expectedCloneUrl(repo.owner, repo.name),
    branch: repo.default_branch
  };
  // Archived submodules are pinned history, not working copies. `update = none`
  // keeps them from ever being fetched on clone, which is why the pointer has to
  // be written through the index rather than through `submodule update`.
  if (repo.archived) entry.update = "none";
  return entry;
}

// Writes `.gitmodules` from scratch in the canonical grouped order. Regenerating
// rather than patching removes any chance of stale stanza keys surviving a
// rename, which is the failure that produces a repository whose gitlink exists
// with no `.gitmodules` entry for it.
export function writeGitmodules(owner: string, repos: Repo[]): void {
  const ordered = [...repos].sort((a, b) => expectedPath(a).localeCompare(expectedPath(b)));

  const chunks = [
    "# Generated by .github/scripts/repo-index.ts from the GitHub repository",
    "# list. Do not edit by hand: any change here is reverted on the next sync, and",
    "# the layout follows one rule -- archived goes under _archive/, active and",
    "# private under _private/, active and public at the root. Run",
    "# `node .github/scripts/sync-workspace.mjs --dry-run` to preview a regeneration."
  ];

  for (const repo of ordered) {
    const entry = gitmodulesEntry(repo.name, { ...repo, owner });
    const lines = [`[submodule "${repo.name}"]`];
    // Path first so the file reads in the same shape as the classification rule.
    for (const field of ["path", "url", "branch", "update"]) {
      if (!entry[field]) continue;
      lines.push(`\t${field} = ${entry[field]}`);
    }
    chunks.push(lines.join("\n"));
  }

  fs.writeFileSync(path.join(ROOT, ".gitmodules"), `${chunks.join("\n\n")}\n`);
}

// `.gitignore` here is a whitelist (`*` then `!` exceptions), so a new
// root-level submodule needs an exception line or git silently ignores it and the
// gitlink never stages. The file is fully generated: a single header of fixed
// entries, then one exception per active public repository, then the two
// directory wildcards which cover `_archive/*` and `_private/*` without needing
// a line per archived repository.
//
// The whole file is rewritten rather than edited in place. Locating the
// generated region inside a partially hand-edited file is exactly the kind of
// guesswork that produces an umbrella where `.gitmodules` or `.github/` silently
// stops being tracked -- which happened while this was being written.
const GITIGNORE_HEADER = [
  "# Generated by .github/scripts/repo-index.ts. Do not edit by hand.",
  "#",
  "# This is a whitelist: `*` ignores everything, and each `!` below re-admits",
  "# one path. A new active public repository needs its own `!name` line here or",
  "# its submodule will not be staged. `_archive/*` and `_private/*` are",
  "# wildcarded, so archived and private repositories need no line of their own.",
  "",
  "*",
  "",
  "!.gitignore",
  "!.gitmodules",
  "!README.md",
  "!AGENTS.md",
  "!.agents/",
  "!.agents/.project/",
  "!.agents/.project/*.md",
  // A whitelist cannot re-include a file whose parent directory is excluded, so
  // every level of a nested path needs its own line: the directory, then a
  // wildcard that admits the directories inside it, then the files.
  "!.agents/skills/",
  "!.agents/skills/*/",
  "!.agents/skills/*/*.md",
  "!.github/",
  "!.github/scripts/",
  "!.github/scripts/*",
  "!.github/workflows/",
  "!.github/workflows/*",
  ""
];

export function writeGitignore(repos: Repo[]): void {
  const rootPaths = repos
    .filter((repo) => !repo.archived && !repo.private)
    .map((repo) => repo.name)
    .sort();

  const block = [
    ...rootPaths.map((name) => `!${name}`),
    "",
    "!_archive",
    "!_archive/*",
    "",
    "!_private",
    "!_private/*",
    ""
  ];

  fs.writeFileSync(path.join(ROOT, ".gitignore"), [...GITIGNORE_HEADER, ...block].join("\n"));
}

// Parses `git ls-files --stage` output for gitlink entries.
//
// The line format is `<mode> <object> <stage>\t<path>`. Fields are parsed by
// position rather than by a hardcoded column offset: an earlier version sliced
// `line.slice(41, tab)`, which silently returns whatever happens to sit at that
// offset. A short or malformed SHA was read back verbatim and written straight
// into `git update-index --cacheinfo`, where git rejects it -- an error that
// pointed at git rather than at the parser.
//
// The SHA is validated here so a bad value is reported as a bad value.
// Parses one `git ls-files --stage` line into its object id, or null when the line
// is not a gitlink or is malformed.
//
// Exported so it can be tested directly. git refuses to write a malformed object
// id, so the values worth guarding against cannot be produced through a real
// index -- only by parsing something else.
export function parseGitlinkLine(line: string): string | null {
  if (!line.startsWith("160000 ")) return null;
  const tab = line.indexOf("\t");
  if (tab === -1) return null;

  // Parsed by field. The object id is not at a fixed column offset, and reading
  // one by slice returned whatever sat at that offset -- including a truncated
  // value, which was then written straight into `git update-index --cacheinfo`.
  const objectId = line.slice(0, tab).trim().split(/\s+/)[1] ?? "";
  return /^[0-9a-f]{40}$/.test(objectId) ? objectId : null;
}

export function readGitlinks(): Map<string, string> {
  const stdout = git("ls-files", "--stage");
  const links = new Map<string, string>();

  for (const line of stdout.split(/\r?\n/)) {
    if (!line.startsWith("160000 ")) continue;
    const objectId = parseGitlinkLine(line);

    if (!objectId) {
      const tab = line.indexOf("\t");
      const path = tab === -1 ? line.trim() : line.slice(tab + 1).trim();
      throw new Error(
        `gitlink for ${path} has an invalid object id; expected 40 hex characters. ` +
          `The index is corrupt.`
      );
    }
    const tab = line.indexOf("\t");
    links.set(line.slice(tab + 1).trim(), objectId);
  }
  return links;
}

export function writeGitlink(repoPath: string, sha: string): void {
  // Validated here rather than left to git: `git update-index --cacheinfo` reports
  // a malformed value as "expects <mode>,<sha1>,<path>", which says nothing about
  // which of the three arguments was wrong or where it came from.
  if (!/^[0-9a-f]{40}$/.test(sha ?? "")) {
    throw new Error(
      `refusing to write ${repoPath}: ${JSON.stringify(sha)} is not a 40-character commit SHA`
    );
  }
  git("update-index", "--add", "--cacheinfo", `160000,${sha},${repoPath}`);
}

export function removeGitlink(repoPath: string): void {
  git("update-index", "--force-remove", repoPath);
}

// Stages only the two generated text files. It must never run `git add --all`:
// that would read every submodule's on-disk HEAD and silently overwrite the
// gitlinks written by `writeGitlink`, which is exactly the value the sync exists
// to set. Gitlinks are staged exclusively through `writeGitlink`.
export function stageGeneratedFiles(): void {
  git("add", "--", ".gitmodules", ".gitignore");
}

// `git diff --cached` cannot be used to decide whether anything is staged. It
// skips any path whose working-tree directory does not exist, and every archived
// submodule is `update = none` and never cloned, so their directories are empty
// or absent. That made 50 correctly-updated archived pointers invisible to the
// diff and would have caused their commit to be skipped entirely. The index is
// the source of truth; compare it against HEAD directly.
export function stagedChanges(): string[] {
  return git("diff-index", "--cached", "--name-status", "HEAD").split(/\r?\n/).filter(Boolean);
}

// Whether anything is staged that a commit would pick up.
//
// `git diff --cached` cannot answer this. It skips any path whose working-tree
// directory does not exist, and every archived submodule is `update = none` and
// never cloned, so their directories are empty or absent. That made 50 correctly
// updated archived pointers invisible to the diff and would have caused their
// commit to be skipped. The index is the source of truth; compare it against HEAD
// directly, path by path.
export function hasStagedChanges(): boolean {
  const index = readGitlinks();
  const head = readHeadGitlinks();

  for (const [path, sha] of index) {
    if (head.get(path) !== sha) return true;
  }
  // Only the two generated text files need an explicit check; everything else in
  // the index is a gitlink.
  return (
    git("diff-index", "--cached", "--name-only", "HEAD", "--", ".gitmodules", ".gitignore").trim() !== ""
  );
}

// The gitlinks recorded in HEAD, as path -> full object id.
function readHeadGitlinks(): Map<string, string> {
  const head = new Map<string, string>();
  for (const line of git("ls-tree", "-r", "HEAD").split(/\r?\n/)) {
    if (!line.startsWith("160000 ")) continue;
    const tab = line.indexOf("\t");
    if (tab === -1) continue;
    // Parsed by field, not by a fixed column offset. `ls-tree` lines are
    // "<mode> <type> <object>\t<path>", and the object is not always at a
    // constant offset.
    const objectId = line.slice(0, tab).trim().split(/\s+/).at(-1) ?? "";
    if (!/^[0-9a-f]{40}$/.test(objectId)) {
      throw new Error(
        `HEAD contains a gitlink with an invalid object id ${JSON.stringify(objectId)} for ` +
          `${line.slice(tab + 1).trim()}; the repository history is corrupt.`
      );
    }
    head.set(line.slice(tab + 1).trim(), objectId);
  }
  return head;
}

// Commits whatever is currently staged and returns the new SHA.
//
// This deliberately does NOT reset the index afterwards. `git reset` discards
// staged content, and the sync stages the next group of pointers immediately
// after this returns -- so a reset here silently threw away the archived
// pointers, and the archived commit then failed with "nothing to commit,
// working tree clean". The three commit groups are separate because they are
// committed separately, not because they need the index cleared in between: a
// successful commit already leaves the index equal to HEAD, so each stage's
// writes are the only staged content.
export function commit(message: string): string {
  git(
    "-c",
    "user.name=github-actions[bot]",
    "-c",
    "user.email=41898282+github-actions[bot]@users.noreply.github.com",
    "commit",
    "-m",
    message
  );
  return git("rev-parse", "HEAD").trim();
}

// One repository, resolved to where it belongs and what it should point at.
export interface DesiredEntry {
  name: string;
  path: string;
  url: string;
  branch: string;
  archived: boolean;
  private: boolean;
}

export interface DesiredState {
  tracked: Repo[];
  byPath: Map<string, DesiredEntry>;
}

// Turns the GitHub repository list into the exact state the workspace should be
// in. Both the bot and the validator consume this, which is what keeps them from
// disagreeing about what "correct" means.
export function desiredState(
  owner: string,
  repos: Repo[],
  options: { selfName: string }
): DesiredState {
  const tracked = repos.filter((repo) => repo.name !== options.selfName);
  const byPath = new Map<string, DesiredEntry>();

  for (const repo of tracked) {
    const repoPath = expectedPath(repo);
    byPath.set(repoPath, {
      name: repo.name,
      path: repoPath,
      url: expectedCloneUrl(owner, repo.name),
      branch: repo.default_branch,
      archived: repo.archived,
      private: repo.private
    });
  }

  return { tracked, byPath };
}

// Every way the workspace can disagree with the repository list, as a
// discriminated union so callers must handle each case explicitly and a new kind
// is a compile error rather than a silently unhandled branch.
export type StructuralChange =
  | { kind: "missing-submodule"; repo: string; path: string; branch: string }
  | { kind: "missing-gitlink"; repo: string; path: string; branch: string }
  | { kind: "unbacked-submodule"; repo: string; path: string }
  | { kind: "unbacked-gitlink"; repo: string; path: string }
  | { kind: "wrong-url"; repo: string; path: string; expected: string; actual: string | undefined }
  | { kind: "wrong-branch"; repo: string; path: string; expected: string; actual: string | undefined }
  | { kind: "wrong-update-mode"; repo: string; path: string; expected: string; actual: string | undefined };

export interface PointerDrift {
  kind: "pointer";
  repo: string;
  path: string;
  current: string;
  want: DesiredEntry;
}

export interface WorkspaceDiff {
  structural: StructuralChange[];
  pointerDrift: PointerDrift[];
  tracked: Repo[];
}

// Compares desired state against what is committed. Returns every discrepancy
// in a form both callers can act on: the bot fixes them, the validator reports
// them with the expected value so a human never has to guess.
export function diffWorkspace(desired: DesiredState): WorkspaceDiff {
  const { byPath, tracked } = desired;
  const gitmodules = readGitmodules();
  const gitlinks = readGitlinks();

  const structural: StructuralChange[] = [];
  const pointerDrift: PointerDrift[] = [];

  const declaredPaths = new Map<string, { name: string; entry: GitmoduleEntry }>();
  for (const [name, entry] of gitmodules) {
    if (!entry.path) continue;
    declaredPaths.set(entry.path, { name, entry });
  }

  for (const [repoPath, want] of byPath) {
    const declared = declaredPaths.get(repoPath);
    if (!declared) {
      structural.push({ kind: "missing-submodule", repo: want.name, path: repoPath, branch: want.branch });
      continue;
    }
    const { entry } = declared;
    if (entry.url !== want.url) {
      structural.push({
        kind: "wrong-url",
        repo: want.name,
        path: repoPath,
        expected: want.url,
        actual: entry.url
      });
    }
    if (entry.branch !== want.branch) {
      structural.push({
        kind: "wrong-branch",
        repo: want.name,
        path: repoPath,
        expected: want.branch,
        actual: entry.branch
      });
    }
    // Archived submodules are frozen history, not working copies: `update = none`
    // keeps them from ever being fetched on clone.
    const expectedUpdate = want.archived ? "none" : undefined;
    if (entry.update !== expectedUpdate) {
      structural.push({
        kind: "wrong-update-mode",
        repo: want.name,
        path: repoPath,
        expected: expectedUpdate ?? "(unset)",
        actual: entry.update ?? "(unset)"
      });
    }

    const pin = gitlinks.get(repoPath);
    if (!pin) {
      structural.push({ kind: "missing-gitlink", repo: want.name, path: repoPath, branch: want.branch });
      continue;
    }
    pointerDrift.push({ kind: "pointer", repo: want.name, path: repoPath, current: pin, want });
  }

  // Entries the list does not account for. Same category as a wrong URL or a
  // stale pointer: the index disagrees with the list and enforcement corrects it.
  // Nothing is being deleted here -- the path simply is not part of the workspace
  // the list describes, which is what makes it an enforcement target.
  for (const [repoPath, { name }] of declaredPaths) {
    if (!byPath.has(repoPath)) {
      structural.push({ kind: "unbacked-submodule", repo: name, path: repoPath });
    }
  }
  for (const repoPath of gitlinks.keys()) {
    if (!byPath.has(repoPath)) {
      const name = repoPath.split("/").pop() ?? repoPath;
      structural.push({ kind: "unbacked-gitlink", repo: name, path: repoPath });
    }
  }

  return { structural, pointerDrift, tracked };
}

// Splits pointer work by whether the target repository is archived. The two
// groups are committed separately so archive churn stays isolated from the
// repositories you actively work in.
export function splitPinsByArchived(pointerDrift: PointerDrift[]): {
  activePins: PointerDrift[];
  archivedPins: PointerDrift[];
} {
  const activePins: PointerDrift[] = [];
  const archivedPins: PointerDrift[] = [];
  for (const item of pointerDrift) {
    (item.want.archived ? archivedPins : activePins).push(item);
  }
  return { activePins, archivedPins };
}