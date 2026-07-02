# Patrik Marius

Root workspace checkout for `marius-patrik`.

This repository tracks the current `marius-patrik` repositories as a nested Git
submodule workspace. Local files outside the workspace manifest are ignored by
default.

`agents` is the active agent package-manager workspace. It owns agent
repositories under `agents/packages/*`, and the CLI inside it is also named
`agents`. SkyBlock Agent is tracked by the `skyblock-agent` repository there.

## Workspace Layout

```text
.
|-- agents/
|   `-- packages/
|       |-- agents-core/
|       |-- agi/
|       |-- andromeda/
|       |-- skyblock-agent/
|       |-- templates/
|       `-- vibe-bot/
|-- packages/
|   `-- singularity/
`-- archive/
    |-- Citizen/
    |-- MMO/
    |-- RSCode/
    `-- Wrkspace/
```

See [PROJECTS.md](PROJECTS.md) for the GitHub repository map.

## Root Repositories

- `andromeda`
- `agents`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `private`
- `vsc-utils`
- `yacht`

## Agent Repositories

Agent repositories are nested inside `agents` and should not be duplicated at
the workspace root.

- `agents/packages/andromeda`
- `agents/packages/agi`
- `agents/packages/skyblock-agent`
- `agents/packages/vibe-bot`

## Templates

- `agents/packages/templates/template-bot`
- `agents/packages/templates/template-cli`
- `agents/packages/templates/template-mono`
- `agents/packages/templates/template-repo`
- `agents/packages/templates/template-web`

## Packages

- `packages/singularity`

## Migrated

- `experience` was migrated into `andromeda/plugins/rommie` and is no longer a
  root workspace submodule.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
