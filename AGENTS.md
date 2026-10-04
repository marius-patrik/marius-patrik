# Umbrella Workspace Agent Rules

This repository is a workspace index, not a package. It owns exactly one thing:
the mapping from GitHub repositories to submodule paths. Every rule below exists
to keep that mapping derived rather than hand-maintained.

## 1. Repository Lifecycle Changes Go Through The Repo Admin Action

Archive, unarchive, privatize, publicize, rename and delete **must** be performed
by the `Repo admin` workflow. Never call `PATCH /repos/{owner}/{repo}` directly,
and never do it from a script that reaches the API on its own.

```bash
gh workflow run repo-admin.yml \
  -f operation=unarchive -f repo=omnis
```

The reason is not ceremony. Each of those operations changes where a repository
belongs in this workspace: archived goes under `_archive/`, active and private
under `_private/`, active and public at the root. A direct API call changes the
repository and leaves the index stale, which turns `Validate` red and blocks
every subsequent merge.

The workflow dispatches `Sync workspace` itself, the sync opens a pull request,
and that pull request merges itself once `Validate` passes. A lifecycle change
therefore needs no follow-up step from you.

## 2. Do Not Hand-Edit The Index

`.gitmodules`, the gitlink entries, and the submodule paths are outputs. Never
add, move or remove one by hand, and never run `git submodule add` or
`git mv` on a path the sync owns. The layout is derived from the repository list
on every run; a hand edit is reverted or duplicated, not respected.

## 3. Renames Are Not Self-Healing. Treat One As A Two-Step Operation

A rename leaves the tracked submodule under the old name while the App sees the
new one. `verify-workspace.ts` classifies any tracked repository it cannot see
as invisible, and an invisible repository makes the sync refuse to run at all --
correctly, because that is also what an under-installed App looks like, and the
alternative is the sync deleting submodules it cannot see.

The consequence is that a rename does not converge on its own. The workspace
stays wedged until the tracked entry is corrected. So:

- Expect to run the sync manually after a rename and to check the result.
- Never rename more than one repository at a time. Concurrent renames make the
  mapping ambiguous, and GitHub's redirect chain will not tell you which old
  name became which new one.
- Re-read the tracked paths against the repository list afterwards rather than
  assuming the mapping.

## 4. Verify Credentials With The Provided Script, Not By Inspection

```bash
node .github/scripts/setup-github-app.ts            # checks key, permissions, installation scope
node .github/scripts/verify-workspace.ts            # checks the index against the repository list
node .github/scripts/test-repo-index.ts             # offline test of the classification rule
```

`setup-github-app.ts` is the fastest way to tell an under-installed App from a
genuine layout problem. It exits non-zero and names the missing permission or the
narrow installation.

The App is `darkfactory-pipeline`, shared with the DarkFactory delivery
pipeline. Narrowing it to what these workflows need would break that pipeline.
The narrowing that protects this repository is the per-job `permission-*` on each
workflow, not the App itself.

## 5. Never Commit Credentials

`APP_ID` and `APP_PRIVATE_KEY` are repository secrets and the private key lives
outside the repository. No workflow, script or document in this tree may contain
a private key, a token, or a `.pem` file.

## 6. Commits And Pull Requests

Conventional Commits, English throughout, one logical change per commit. Changes
go through a pull request; `main` is protected and `Validate` is a required check
under strict branch protection. Bot-authored index changes arrive on
`bot/sync-workspace` and merge themselves.

## 7. When The Sync Refuses To Run

The refusal is a safety property, not an obstacle to route around. Read the
named repositories and work out which case applies:

| Symptom | Meaning | Action |
| --- | --- | --- |
| A tracked repository is invisible and its old name 301s to a new name | rename | see rule 3 |
| A tracked repository is invisible with no redirect | deleted | confirm deletion was intended, then run the sync |
| The App installation is `selected`, not `all` | under-installed | widen it, or the sync will keep refusing |

Never widen the installation to work around a rename. Widening is correct only
when the App genuinely is not installed everywhere.