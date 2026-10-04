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

## 3. Renames And Deletions Reconcile Automatically

Do not treat a rename or a deletion as special. From the index's point of view
both are the same event: a name that used to appear has stopped. A rename adds a
second event, a name that has started appearing, and the new submodule gets its
pointer resolved from the new repository rather than inherited from the old one.

There is nothing to do by hand after either operation. Run the sync and let it
reconcile. Two things are still worth knowing:

- **Rename one repository at a time.** GitHub's redirect chain will not tell you
  which old name became which new one once they are interleaved, so a batch of
  renames leaves the mapping genuinely unrecoverable.
- **Do not widen the App installation to force the sync through.** That is
  correct only when the App genuinely is not installed everywhere.

## 4. Completeness Is The Only Thing That Gates Removal

The sync's one destructive operation is removing a submodule whose repository is
absent from the repository list. That is only safe when the list is *complete*,
because an App installed on a subset authenticates normally, returns HTTP 200,
and returns a short list with no warning. Absence of an error is not evidence
that a repository is gone.

Completeness is asserted from the App's `repository_selection`, which an
installation token cannot read -- `GET /app/installations` answers 401 to one.
So `assert-enumeration-complete.ts` runs as its own step in CI and as its own job
in the sync, and passes the conclusion down as a boolean. The sync never sees the
private key.

If a run refuses to remove submodules, the list was not proven complete. That is
the guard working, not an obstacle to route around.

## 5. Verify Credentials With The Provided Script, Not By Inspection

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

## 6. Never Commit Credentials

`APP_ID` and `APP_PRIVATE_KEY` are repository secrets and the private key lives
outside the repository. No workflow, script or document in this tree may contain
a private key, a token, or a `.pem` file.

## 7. Commits And Pull Requests

Conventional Commits, English throughout, one logical change per commit. Changes
go through a pull request; `main` is protected and `Validate` is a required check
under strict branch protection. Bot-authored index changes arrive on
`bot/sync-workspace` and merge themselves.

## 8. When The Sync Refuses To Run

The refusal is a safety property, not an obstacle to route around. Read the
named repositories and work out which case applies:

| Message | Meaning | Action |
| --- | --- | --- |
| `the repository list is not proven complete` | the assertion did not run, or the installation is narrow | check the `Assert every installation covers all repositories` step; widen the installation only if it genuinely is narrow |
| `... but marius-patrik/X no longer exists` | a real deletion, once completeness is proven | nothing; reconcile and commit it |
| `X: located at A, but ... belong at B` | a move | nothing; the sync relocates the gitlink |
| `X is a GitHub repository but has no .gitmodules entry` | a new repository | nothing; the sync adds it |

Only the first row is a problem, and it is a problem with the installation rather
than with the index.