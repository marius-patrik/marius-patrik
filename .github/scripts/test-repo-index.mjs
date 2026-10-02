#!/usr/bin/env node
// Runs the workspace scripts against a synthetic GitHub repository list and a
// synthetic index, to prove the classification and pointer logic without touching
// the real repository or spending API calls.
//
// The archived-pins case is the one that matters most: those submodules are
// `update = none` and never cloned, so nothing here may assume a working tree.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const script = process.argv[2] ?? path.resolve(process.cwd(), ".github/scripts/repo-index.mjs");

const OWNER = "marius-patrik";
const CASES = [
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
    // it must be reported as a missing entry at the new path plus a stale stanza
    // and stale gitlink at the old one, since all three are separate cleanups.
    name: "active private repository at the root is reported as misplaced",
    repos: [{ name: "beta", archived: false, private: true, default_branch: "main" }],
    gitmodules: { beta: { path: "beta", url: `https://github.com/${OWNER}/beta.git`, branch: "main" } },
    links: { beta: "2".repeat(40) },
    expect: [
      { kind: "missing-submodule", path: "_private/beta" },
      { kind: "stale-submodule", path: "beta" },
      { kind: "stale-gitlink", path: "beta" }
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
    name: "a deleted repository leaves a stale gitlink behind",
    repos: [],
    gitmodules: { zeta: { path: "_archive/zeta", url: `https://github.com/${OWNER}/zeta.git`, branch: "main" } },
    links: { "_archive/zeta": "6".repeat(40) },
    expect: [
      { kind: "stale-submodule", path: "_archive/zeta" },
      { kind: "stale-gitlink", path: "_archive/zeta" }
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

let failures = 0;

for (const testCase of CASES) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "repo-index-"));
  try {
    buildFixture(dir, testCase);

    const actual = runDiff(script, dir, OWNER, testCase.repos);
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

console.log(failures === 0 ? `\n${CASES.length} passed` : `\n${failures} failed`);
process.exit(failures === 0 ? 0 : 1);

function buildFixture(dir, testCase) {
  const git = (...args) => execFileSync("git", ["-C", dir, ...args], { stdio: "pipe" });
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
function runDiff(scriptPath, dir, owner, repos) {
  const shim = path.join(dir, "repo-index.mjs");
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
  fs.writeFileSync(path.join(dir, "run.mjs"), runner);

  const output = execFileSync("node", [path.join(dir, "run.mjs")], { encoding: "utf8" });
  const parsed = JSON.parse(output);
  return parsed.structural;
}