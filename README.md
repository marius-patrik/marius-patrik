# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as a flat root-level
submodule list. Archived repositories are grouped under `archive/`. Agentos owns
the nested agent, app, harness, package, plugin, skills, and data submodules.

Andromeda is managed by Agentos at `agents-mono/plugins/andromeda`. Singularity is
managed at `agents-mono/apps/singularity`. The private workspace material is under
`agents-mono/workspaces`.

## Workspace Layout

```text
.
|-- agents-mono/
|   |-- agents/
|   |   |-- darkfactory-agent/
|   |   |-- life-support/
|   |   `-- skyblock-agent/
|   |-- apps/
|   |   |-- fabrica/
|   |   `-- singularity/
|   |-- harnesses/
|   |   `-- andromeda-harness/
|   |-- os/
|   |   |-- agents-core/
|   |   `-- agents-manager/
|   |-- llm-gateway/
|   |-- inference-engine/
|   |-- data/
|   |   `-- data-agentos/
|   |-- plugins/
|   |   |-- andromeda/
|   |   `-- dream/
|   |-- skills/
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

- `agents-mono`
- `andromeda-harness`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `vsc-utils`
- `yacht`

## Agentos Managed Repositories

- `agents-mono/agents/darkfactory-agent`
- `agents-mono/agents/life-support`
- `agents-mono/agents/skyblock-agent`
- `agents-mono/apps/fabrica`
- `agents-mono/apps/singularity`
- `agents-mono/harnesses/andromeda-harness`
- `agents-mono/os/agents-core`
- `agents-mono/os/agents-manager`
- `agents-mono/llm-gateway`
- `agents-mono/inference-engine`
- `agents-mono/plugins/andromeda`
- `agents-mono/plugins/dream`
- `agents-mono/skills`
- `agents-mono/templates/darkfactory-templates`
- `agents-mono/workspaces/darkfactory-workspace`

## Migrated

- `experience` was migrated into the Andromeda plugin and is no longer a profile workspace submodule.
- Andromeda wiki and research material was moved into `agents-mono/workspaces` under
  `andromeda/wiki` and `andromeda/research` as part of workspace consolidation.
- The former memory plugin was renamed to `andromeda-plugin` and lives at `agents-mono/plugins/andromeda`.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`

