# Patrik Marius

Root workspace checkout for `marius-patrik`.

This repository tracks the current `marius-patrik` repositories as a nested Git
submodule workspace. Local files outside the workspace manifest are ignored by
default.

`agent-os` is the active agent package-manager workspace. It owns agent
repositories under `agent-os/packages/*`, and the CLI inside it is still named
`agents`. SkyBlock Agent is tracked by the `skyblock-agent` repository there.

## Workspace Layout

```text
.
|-- agent-os/
|   `-- packages/
|       |-- agent-package-manager/
|       |-- agi/
|       |-- agent-harness/
|       |-- skyblock-agent/
|       |-- templates/
|       `-- vibe-bot/
|-- agent-harness/
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

- `agent-harness`
- `agent-os`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `private`
- `vsc-utils`
- `yacht`

## Agent Repositories

Agent repositories are nested inside `agent-os` and should not be duplicated at
the workspace root.

- `agent-os/packages/agent-harness`
- `agent-os/packages/agi`
- `agent-os/packages/skyblock-agent`
- `agent-os/packages/vibe-bot`

## Templates

- `agent-os/packages/templates/template-bot`
- `agent-os/packages/templates/template-cli`
- `agent-os/packages/templates/template-mono`
- `agent-os/packages/templates/template-repo`
- `agent-os/packages/templates/template-web`

## Packages

- `packages/singularity`

## Migrated

- `experience` was migrated into `agent-harness/packages/rommie` and is no longer a
  root workspace submodule.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
