# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as a flat root-level
submodule list. Archived repositories are grouped under `archive/`. Agentos owns
the nested agent, app, harness, package, template, plugin, skills, and
data submodules.

Rommie is managed by Agentos at `agents-mono/plugins/andromeda`. Singularity is
managed at `agents-mono/apps/singularity`. The private workspace material is under
`agents-mono/packages/workspaces`.

## Workspace Layout

```text
.
|-- agents-mono/
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
|   |   |-- llm-gateway/
|   |   |-- inference-engine/
|   |   |-- agents-manager/
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
- `agents-mono/plugins/andromeda`
- `agents-mono/agents/skyblock-agent`
- `agents-mono/apps/fabrica`
- `agents-mono/apps/singularity`
- `agents-mono/harnesses/andromeda-harness`
- `agents-mono/plugins/dream`
- `agents-mono/skills`
- `agents-mono/templates/darkfactory-templates`
- `agents-mono/workspaces/darkfactory-workspace`

## Agentos Packages

- `agents-mono/packages/agentos-core`
- `agents-mono/packages/llm-gateway`
- `agents-mono/packages/inference-engine`
- `agents-mono/packages/agents-manager`

## Migrated

- `experience` was migrated into `agents-mono/plugins/andromeda` and is no longer
  a profile workspace submodule.
- Andromeda wiki and research material was moved into `agents-mono/workspaces` under
  `andromeda/wiki` and `andromeda/research` as part of workspace consolidation.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`


