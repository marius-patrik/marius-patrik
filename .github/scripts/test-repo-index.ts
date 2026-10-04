#!/usr/bin/env node
// Runs the workspace scripts against a synthetic GitHub repository list and a
// synthetic index, to prove the classification and pointer logic without touching
// the real repository or spending API calls.
//
// The enforcement boundary gets its own cases below. Every classification case runs
// against a complete list, so none of them can observe what happens when the list
// cannot be believed -- which is the only situation where enforcing the wrong thing
// costs live submodules rather than merely failing.
//
// The archived-pins case is the one that matters most: those submodules are
// `update = none` and never cloned, so nothing here may assume a working tree.
import { execFileSync } from "node:child_process";
import { assertDesiredStateTrusted, parseGitlinkLine } from "./repo-index.ts";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const script = process.argv[2] ?? path.resolve(process.cwd(), ".github/scripts/repo-index.ts");

const OWNER = "marius-patrik";
const CASES: {
  name: string;
  repos: TestRepo[];
  gitmodules: Record<string, Record<string, string>>;
  links: Record<string, string>;
  expect: { kind: string; path: string }[];
}[] = [
  {
    name: "active public repository sits at the root",
    repos: [{ name: "alpha", archived: false, private: false, default_branch: "main" }],
    gitmodules: { alpha: { path: "alpha", url: `https://github.com/${OWNER}/alpha.git`, branch: "main" } },
    links: { alpha: "1".repeat(40) },
    expect: []
  },
  {
    // A private repository sitting at the root is the live case in this
    // workspace: `Study` was tracked at the root despite being private. Relocating
    // it must be reported as a missing entry at the new path plus an unbacked
    // stanza and gitlink at the old one: three separate mismatches to correct.
    name: "active private repository at the root is reported as misplaced",
    repos: [{ name: "beta", archived: false, private: true, default_branch: "main" }],
    gitmodules: { beta: { path: "beta", url: `https://github.com/${OWNER}/beta.git`, branch: "main" } },
    links: { beta: "2".repeat(40) },
    expect: [
      { kind: "missing-submodule", path: "_private/beta" },
      { kind: "unbacked-submodule", path: "beta" },
      { kind: "unbacked-gitlink", path: "beta" }
    ]
  },
  {
    name: "archived repository belongs under _archive/ with update = none",
    repos: [{ name: "gamma", archived: true, private: true, default_branch: "main" }],
    gitmodules: {
      gamma: { path: "_archive/gamma", url: `https://github.com/${OWNER}/gamma.git`, branch: "main", update: "none" }
    },
    links: { "_archive/gamma": "3".repeat(40) },
    expect: []
  },
  {
    name: "archived repository missing update = none is reported",
    repos: [{ name: "delta", archived: true, private: false, default_branch: "main" }],
    gitmodules: { delta: { path: "_archive/delta", url: `https://github.com/${OWNER}/delta.git`, branch: "main" } },
    links: { "_archive/delta": "4".repeat(40) },
    expect: [{ kind: "wrong-update-mode", path: "_archive/delta" }]
  },
  {
    name: "stale branch is reported against the remote default branch",
    repos: [{ name: "epsilon", archived: false, private: false, default_branch: "trunk" }],
    gitmodules: { epsilon: { path: "epsilon", url: `https://github.com/${OWNER}/epsilon.git`, branch: "main" } },
    links: { epsilon: "5".repeat(40) },
    expect: [{ kind: "wrong-branch", path: "epsilon" }]
  },
  {
    name: "a path the list does not account for leaves an unbacked gitlink",
    repos: [],
    gitmodules: { zeta: { path: "_archive/zeta", url: `https://github.com/${OWNER}/zeta.git`, branch: "main" } },
    links: { "_archive/zeta": "6".repeat(40) },
    expect: [
      { kind: "unbacked-submodule", path: "_archive/zeta" },
      { kind: "unbacked-gitlink", path: "_archive/zeta" }
    ]
  },
  {
    name: "a new repository with no submodule at all is reported",
    repos: [{ name: "eta", archived: false, private: false, default_branch: "main" }],
    gitmodules: {},
    links: {},
    expect: [{ kind: "missing-submodule", path: "eta" }]
  }
];

// Guards the gitlink parsing, which is where a silent corruption cost the most
// time to find. `git ls-files --stage` lines were parsed with a hardcoded column
// offset; a short object id was read back verbatim and passed straight to
// `git update-index --cacheinfo`, which reported "expects <mode>,<sha1>,<path>"
// -- an error naming all three arguments and none of the real problem.
//
// The parser is exercised directly rather than through a real index, because git
// refuses to write a malformed object id in the first place: the whole point is
// the values git would never produce on its own.
const GITLINK_PARSING: { name: string; line: string; expected: string | null }[] = [
  {
    name: "a 40-character object id is read back intact",
    line: `160000 ${"a".repeat(40)} 0\tx`,
    expected: "a".repeat(40)
  },
  {
    name: "a short object id is rejected, not passed through",
    line: "160000 abc1234 0\tx",
    expected: null
  },
  {
    name: "a line with no tab is skipped rather than mis-sliced",
    line: `160000 ${"b".repeat(40)} 0`,
    expected: null
  },
  {
    name: "a non-hex object id is rejected",
    line: `160000 zzzz${"b".repeat(36)} 0\tx`,
    expected: null
  },
  {
    name: "a non-gitlink mode is ignored entirely",
    line: `100644 ${"c".repeat(40)} 0\t.gitmodules`,
    expected: null
  }
];

let failures = 0;

for (const testCase of GITLINK_PARSING) {
  const actual = parseGitlinkLine(testCase.line);
  if (actual === testCase.expected) {
    console.log(`ok    ${testCase.name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${testCase.name}`);
    console.log(`        expected ${JSON.stringify(testCase.expected)}`);
    console.log(`        actual   ${JSON.stringify(actual)}`);
  }
}

for (const testCase of CASES) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "repo-index-"));
  try {
    buildFixture(dir, testCase);

    const actual = runDiff(script, dir, OWNER, testCase.repos as TestRepo[]);
    const expected = [...testCase.expect].sort();
    const got = actual.sort();

    const pass = JSON.stringify(expected) === JSON.stringify(got);
    if (pass) {
      console.log(`ok    ${testCase.name}`);
    } else {
      failures += 1;
      console.log(`FAIL  ${testCase.name}`);
      console.log(`        expected ${JSON.stringify(expected)}`);
      console.log(`        actual   ${JSON.stringify(got)}`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// The enforcement boundary, exercised directly. These are the cases where getting
// it wrong costs live submodules, and none of them is observable from the
// classification cases above: those all run with a complete list.
const GUARD_CASES: {
  name: string;
  repoNames: string[];
  trackedNames: string[];
  complete: boolean;
  expect: "accept" | "reject";
  expectMentions?: string;
}[] = [
  {
    name: "a complete list is enforced",
    repoNames: ["marius-patrik", "alpha", "beta"],
    trackedNames: ["alpha", "beta"],
    complete: true,
    expect: "accept"
  },
  {
    // The live situation for an hour on 2026-10-04: six repositories renamed and
    // two deleted, all intentional. With completeness proven these are just paths
    // the list no longer accounts for, and enforcing them is the entire job.
    name: "with completeness proven, a name the list dropped is enforced, not refused",
    repoNames: ["marius-patrik", "andromeda-old-2"],
    trackedNames: ["Andromeda", "froq"],
    complete: true,
    expect: "accept"
  },
  {
    name: "an unproven list is refused even when nothing is absent",
    repoNames: ["marius-patrik", "alpha", "beta"],
    trackedNames: ["alpha", "beta"],
    complete: false,
    expect: "reject",
    expectMentions: "may or may not be all of them"
  },
  {
    name: "an unproven list is refused, and names what it cannot see",
    repoNames: ["marius-patrik", "alpha"],
    trackedNames: ["alpha", "Andromeda", "froq", "super-orca"],
    complete: false,
    expect: "reject",
    expectMentions: "Andromeda"
  },
  {
    // An under-installed App is the failure this exists for. It returns 200 with a
    // short list, so nothing but the coverage assertion distinguishes it from a
    // correct enumeration.
    name: "a partial list is refused rather than enforced as the workspace",
    repoNames: ["marius-patrik", "alpha"],
    trackedNames: ["alpha", "beta", "gamma", "delta"],
    complete: false,
    expect: "reject"
  },
  {
    name: "a list missing the umbrella is refused even when marked complete",
    repoNames: ["alpha", "beta"],
    trackedNames: ["alpha", "beta"],
    complete: true,
    expect: "reject",
    expectMentions: "not in the repository list"
  },
  {
    // A repo-scoped GITHUB_TOKEN sees exactly this, and nothing else would stop
    // it being enforced as if it were the whole account.
    name: "a list of only the umbrella is refused once submodules are tracked",
    repoNames: ["marius-patrik"],
    trackedNames: ["alpha", "beta"],
    complete: true,
    expect: "reject",
    expectMentions: "repository-scoped credential"
  },
  {
    name: "an account that really has one repository is not obstructed",
    repoNames: ["marius-patrik"],
    trackedNames: [],
    complete: true,
    expect: "accept"
  }
];

for (const testCase of GUARD_CASES) {
  let message: string | null = null;
  try {
    assertDesiredStateTrusted({
      repoNames: testCase.repoNames,
      trackedNames: testCase.trackedNames,
      selfName: OWNER,
      complete: testCase.complete
    });
  } catch (error) {
    message = (error as Error).message;
  }

  const accepted = message === null;
  const wantAccepted = testCase.expect === "accept";
  const mentions = !testCase.expectMentions || (message?.includes(testCase.expectMentions) ?? false);

  if (accepted === wantAccepted && mentions) {
    console.log(`ok    ${testCase.name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${testCase.name}`);
    console.log(`        expected ${testCase.expect}${testCase.expectMentions ? ` mentioning ${JSON.stringify(testCase.expectMentions)}` : ""}`);
    console.log(`        actual   ${accepted ? "accept" : `reject: ${message}`}`);
  }
}

function buildFixture(dir: string, testCase: (typeof CASES)[number]): void {
  const git = (...args: string[]) => execFileSync("git", ["-C", dir, ...args], { stdio: "pipe" });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "t@example.com");
  git("config", "user.name", "test");

  // .gitmodules is written by hand here because the fixture is the input, not the
  // output under test.
  const stanzas = Object.entries(testCase.gitmodules).map(([name, entry]) => {
    const lines = [`[submodule "${name}"]`];
    for (const field of ["path", "url", "branch", "update"]) {
      if (entry[field]) lines.push(`\t${field} = ${entry[field]}`);
    }
    return lines.join("\n");
  });
  fs.writeFileSync(path.join(dir, ".gitmodules"), `${stanzas.join("\n\n")}\n`);
  git("add", ".gitmodules");
  for (const [linkPath, sha] of Object.entries(testCase.links)) {
    git("update-index", "--add", "--cacheinfo", `160000,${sha},${linkPath}`);
  }
  git("commit", "-qm", "fixture");
}

// The fixture writes its own copy of the module with ROOT pointed at the temp
// directory, so importing the real one would operate on the real repository.
interface TestRepo {
  name: string;
  archived: boolean;
  private: boolean;
  default_branch: string;
}

function runDiff(scriptPath: string, dir: string, owner: string, repos: TestRepo[]): unknown[] {
  const shim = path.join(dir, "repo-index.ts");
  const source = fs
    .readFileSync(scriptPath, "utf8")
    .replace(
      /export const ROOT = .*;/,
      `export const ROOT = ${JSON.stringify(dir)};`
    );
  fs.writeFileSync(shim, source);

  const runner = `
    import { desiredState, diffWorkspace, expectedPath } from ${JSON.stringify(shim)};
    const repos = ${JSON.stringify(repos)}.map((repo) => ({
      name: repo.name,
      archived: repo.archived,
      private: repo.private,
      default_branch: repo.default_branch
    }));
    const desired = desiredState(${JSON.stringify(owner)}, repos, { selfName: "marius-patrik" });
    const { structural, pointerDrift } = diffWorkspace(desired);
    process.stdout.write(JSON.stringify({
      structural: structural.map((c) => ({ kind: c.kind, path: c.path })),
      pointerDrift: pointerDrift.map((p) => ({ path: p.path, current: p.current }))
    }));
  `;
  fs.writeFileSync(path.join(dir, "run.ts"), runner);

  const output = execFileSync("node", [path.join(dir, "run.ts")], { encoding: "utf8" });
  const parsed = JSON.parse(output);
  return parsed.structural;
}