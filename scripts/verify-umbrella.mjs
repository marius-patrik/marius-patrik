#!/usr/bin/env node
// The umbrella repository is a workspace index, not a product. What it owns is
// submodule pointer hygiene and an accurate project map, so that is exactly
// what this validator checks. Package build, test, and release validation
// belongs to the nested repositories.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const issues = [];

function git(...args) {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

const gitmodulesPath = path.join(root, ".gitmodules");
if (!fs.existsSync(gitmodulesPath)) {
  issues.push(".gitmodules is missing: the umbrella repository is defined by its submodule pointers");
}

let declared = [];
if (issues.length === 0) {
  try {
    declared = git("config", "--file", ".gitmodules", "--get-regexp", "^submodule\\..*\\.path$")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.slice(line.indexOf(" ") + 1).trim())
      .sort();
  } catch {
    issues.push(".gitmodules is not parseable by git config");
  }
}

if (declared.length === 0 && issues.length === 0) {
  issues.push(".gitmodules declares no submodules: the project map would be empty");
}

// Every declared path must be a real gitlink, and every gitlink must be declared.
const gitlinks = git("ls-files", "--stage")
  .split(/\r?\n/)
  .filter((line) => line.startsWith("160000 "))
  .map((line) => line.slice(line.indexOf("\t") + 1).trim())
  .sort();

for (const declaredPath of declared) {
  if (!gitlinks.includes(declaredPath)) {
    issues.push(`declared submodule has no gitlink in the index: ${declaredPath}`);
  }
}
for (const gitlink of gitlinks) {
  if (!declared.includes(gitlink)) {
    issues.push(`gitlink is not declared in .gitmodules: ${gitlink}`);
  }
}

// The project map must describe exactly the submodules that exist. A stale map
// is the failure mode this repository is most prone to.
const projectsPath = path.join(root, "PROJECTS.md");
if (!fs.existsSync(projectsPath)) {
  issues.push("PROJECTS.md is missing: the umbrella repository owns the project map");
} else {
  const projects = fs.readFileSync(projectsPath, "utf8");
  const documented = [...projects.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)].map((match) => match[1]);
  for (const declaredPath of declared) {
    if (!documented.includes(declaredPath)) {
      issues.push(`PROJECTS.md does not document submodule: ${declaredPath}`);
    }
  }
  for (const documentedPath of documented) {
    if (!declared.includes(documentedPath)) {
      issues.push(`PROJECTS.md documents a path that is not a submodule: ${documentedPath}`);
    }
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`error: ${issue}`);
  process.exit(1);
}
console.log(`Umbrella workspace verified: ${declared.length} submodule pointers documented and staged.`);
