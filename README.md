# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as a flat root-level
submodule list. Archived repositories are grouped under `archive/`. Agentos owns
the nested agent, app, harness, package, template, and private workspace
submodules.

Rommie is managed by Agentos at `agentos/agents/rommie-agent`. Singularity is
managed at `agentos/apps/singularity`. The private Agentos workspace repository
is tracked at `agentos/workspace`.

## Workspace Layout

```text
.
|-- agentos/
|   |-- agents/
|   |   |-- dark-factory/
|   |   |-- life-support/
|   |   |-- rommie-agent/
|   |   `-- skyblock-agent/
|   |-- apps/
|   |   `-- singularity/
|   |-- harnesses/
|   |   `-- andromeda-harness/
|   |-- packages/
|   |   |-- agentos-core/
|   |   |-- agentos-gateway/
|   |   |-- agentos-inferer/
|   |   `-- agentos-manager/
|   |-- templates/
|   `-- workspace/
|       `-- andromeda/
|           |-- research/
|           `-- wiki/
|-- andromeda-harness/
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
- `andromeda-harness`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `vsc-utils`
- `yacht`

## Agentos Managed Repositories

- `agentos/agents/dark-factory`
- `agentos/agents/life-support`
- `agentos/agents/rommie-agent`
- `agentos/agents/skyblock-agent`
- `agentos/apps/singularity`
- `agentos/harnesses/andromeda-harness`
- `agentos/templates/*`
- `agentos/workspace`

## Agentos Packages

- `agentos/packages/agentos-core`
- `agentos/packages/agentos-gateway`
- `agentos/packages/agentos-inferer`
- `agentos/packages/agentos-manager`

## Migrated

- `experience` was migrated into `agentos/agents/rommie-agent` and is no longer
  a profile workspace submodule.
- Andromeda wiki and research material was moved into `agentos/workspace` under
  `andromeda/wiki` and `andromeda/research`.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
