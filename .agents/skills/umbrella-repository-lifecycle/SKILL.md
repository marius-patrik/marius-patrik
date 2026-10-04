---
name: umbrella-repository-lifecycle
description: Change a repository's lifecycle (archive, unarchive, privatize, publicize, rename, delete) in the marius-patrik umbrella workspace through the Repo admin action, and verify the workspace index reconciled afterwards. Use when asked to archive, unarchive, hide, publish, rename or delete any repository under the marius-patrik account, or when asked where a repository belongs in the workspace.
---

# Umbrella repository lifecycle

The umbrella workspace derives one thing: which path each GitHub repository
belongs at. Lifecycle operations change that path, so they go through the
`Repo admin` action and let the action reconcile.

## Layout rule

| Repository state | Path |
| --- | --- |
| archived | `_archive/<name>` |
| active and private | `_private/<name>` |
| active and public | `<name>` at the repository root |

Archived submodules also carry `update = none` in `.gitmodules`.

## Performing an operation

```bash
gh workflow run repo-admin.yml -f operation=<op> -f repo=<name>
```

Operations: `archive`, `unarchive`, `privatize`, `publicize`, `rename`, `delete`.

`rename` additionally needs `-f new_name=<new>`. `delete` additionally needs
`-f confirm_name=<name>` retyped exactly, and refuses unless the repository is
already archived.

Then wait. The workflow dispatches `Sync workspace`, which opens a pull request
that merges itself once `Validate` passes. Do not dispatch the sync yourself and
do not merge the pull request yourself.

```bash
gh run list --workflow repo-admin.yml --limit 1
gh run watch <run-id>
```

## Refusals are deliberate

`repo-admin.ts` exits non-zero with a reason rather than letting GitHub return a
bare error. Read it; do not work around it.

- The umbrella itself (`marius-patrik`) cannot be archived, renamed, privatized
  or deleted — it runs the workflows.
- A fork's visibility cannot change in isolation; GitHub binds it to the network.
- A repository with GitHub Pages enabled cannot be privatized without taking the
  site down.
- `delete` requires the repository to be archived first, and the name retyped.

## Verifying

```bash
node .github/scripts/setup-github-app.ts   # key, permissions, installation scope
node .github/scripts/verify-workspace.ts   # index matches the repository list
```

`verify-workspace.ts` exits non-zero on any mismatch and prints the expected
value for each, e.g. `StatusLine: located at _archive/StatusLine, but private
repositories belong at _private/StatusLine`.

## Renames do not converge on their own

This is the one operation that needs hands-on follow-up, and it is a known
limitation rather than a misuse.

After a rename the tracked submodule keeps the old name while the App reports the
new one. `verify-workspace.ts` treats any tracked repository it cannot see as
invisible, and invisible repositories make the sync refuse to run — deliberately,
because that is indistinguishable from an under-installed App, and the
alternative is the sync deleting submodules it cannot see.

So after a rename:

1. Dispatch `sync-workspace.yml` once and expect it to refuse.
2. Establish the old-to-new mapping yourself. GitHub redirects a renamed
   repository's old URL, but a chain of renames will not tell you which old name
   became which new one, so rename one repository at a time.
3. If a tracked repository is invisible with no redirect at all, it was deleted.
   Confirm that was intended before treating it as such.

## Visibility changes are not symmetric

`privatize` erases stars and watchers permanently, and a public history that is
made private again becomes secret rather than deleted. `publicize` publishes the
entire history, including commits previously pushed to private forks. Neither is
undoable. Confirm intent before either.