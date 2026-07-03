# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as a flat root-level
submodule list. Archived repositories are grouped under `archive/`. Agentos owns
the nested agent, app, harness, package, template, plugin, skills, and
data submodules.

Rommie is managed by Agentos at `agents-os/agents/rommie-agent`. Singularity is
managed at `agents-os/apps/singularity`. The private workspace material is under
`agents-os/packages/workspaces`.

## Workspace Layout

```text
.
|-- agents-os/
|   |-- agents/
|   |   |-- darkfactory-agent/
|   |   |-- life-support/
|   |   |-- rommie-agent/
|   |   `-- skyblock-agent/
|   |-- apps/
|   |   |-- fabrica/
|   |   `-- singularity/
|   |-- harnesses/
|   |   `-- andromeda-harness/
|   |-- packages/
|   |   |-- agentos-core/
|   |   |-- agentos-gateway/
|   |   |-- agentos-inferer/
|   |   |-- agentos-manager/
|   |-- data/
|   |   `-- data-agentos/
|   |   |-- plugins/
|   |   |   `-- dream/
|   |   `-- skills/
|   |-- templates/
|   |   `-- darkfactory-templates/
|   `-- workspaces/
|       `-- darkfactory-workspace/
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

- `agents-os`
- `andromeda-harness`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `vsc-utils`
- `yacht`

## Agentos Managed Repositories

- `agents-os/agents/darkfactory-agent`
- `agents-os/agents/life-support`
- `agents-os/agents/rommie-agent`
- `agents-os/agents/skyblock-agent`
- `agents-os/apps/fabrica`
- `agents-os/apps/singularity`
- `agents-os/harnesses/andromeda-harness`
- `agents-os/plugins/dream`
- `agents-os/skills`
- `agents-os/templates/darkfactory-templates`
- `agents-os/workspaces/darkfactory-workspace`

## Agentos Packages

- `agents-os/packages/agentos-core`
- `agents-os/packages/agentos-gateway`
- `agents-os/packages/agentos-inferer`
- `agents-os/packages/agentos-manager`

## Migrated

- `experience` was migrated into `agents-os/agents/rommie-agent` and is no longer
  a profile workspace submodule.
- Andromeda wiki and research material was moved into `agents-os/workspaces` under
  `andromeda/wiki` and `andromeda/research` as part of workspace consolidation.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
