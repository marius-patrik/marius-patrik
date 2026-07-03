# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as root-level Git
submodules. Archived repositories are grouped under `archive/`, and `agentos`
owns managed agent, app, package, and template submodules. Local files outside
the workspace manifest are ignored by default.

Rommie is managed by `agentos` at `agentos/agents/rommie`. Singularity is
managed at `agentos/apps/singularity`. The private workspace repository is
managed at `agentos/workspace`.

## Workspace Layout

```text
.
|-- agentos/
|   |-- agents/
|   |   |-- agi/
|   |   |-- dark-factory/
|   |   |-- rommie/
|   |   `-- skyblock-agent/
|   |-- apps/
|   |   `-- singularity/
|   |-- packages/
|   |   |-- agentos-harness/
|   |   `-- agentos-manager/
|   |-- templates/
|   `-- workspace/
|-- agentos-harness/
|-- Fabrica/
|-- media-streamer/
|-- mssgs/
|-- vsc-utils/
|-- yacht/
`-- archive/
    |-- Citizen/
    |-- MMO/
    |-- RSCode/
    `-- Wrkspace/
```

See [PROJECTS.md](PROJECTS.md) for the GitHub repository map.

## Root Repositories

- `agentos`
- `agentos-harness`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `vsc-utils`
- `yacht`

## Agentos Managed Repositories

- `agentos/agents/agi`
- `agentos/agents/dark-factory`
- `agentos/agents/rommie`
- `agentos/agents/skyblock-agent`
- `agentos/apps/singularity`
- `agentos/packages/agentos-harness`
- `agentos/templates/*`
- `agentos/workspace`

## Migrated

- `experience` was migrated into `agentos/agents/rommie` and is no longer a
  profile workspace submodule.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
