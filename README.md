# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as a flat root-level
submodule list. Archived repositories are grouped under `archive/`. Agentos owns
the nested agent, app, OS package, plugin, skills, and data submodules.

Rommie is managed by Agentos at `agents-mono/os/agents-plugin`. Singularity is
managed at `agents-mono/apps/singularity`. The private workspace material is under
`agents-mono/workspaces`.

## Workspace Layout

```text
.
|-- agents-mono/
|   |-- agents/
|   |   |-- agent-darkfactory/
|   |   |-- life-support/
|   |   `-- skyblock-agent/
|   |-- apps/
|   |   |-- fabrica/
|   |   `-- singularity/
|   |-- os/
|   |   |-- agents-core/
|   |   |-- agents-manager/
|   |   |-- agents-harness/
|   |   |-- agents-plugin/
|   |   |-- llm-gateway/
|   |   `-- inference-engine/
|   |-- data/
|   |   `-- data-agentos/
|   |-- plugins/
|   |   `-- dream/
|   |-- skills/
|   |-- templates/
|   |   `-- darkfactory-templates/
|   `-- workspaces/
|       `-- workspace-darkfactory/
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
- `Fabrica`
- `media-streamer`
- `mssgs`
- `vsc-utils`
- `yacht`

## Agentos Managed Repositories

- `agents-mono/agents/agent-darkfactory`
- `agents-mono/agents/life-support`
- `agents-mono/agents/skyblock-agent`
- `agents-mono/apps/fabrica`
- `agents-mono/apps/singularity`
- `agents-mono/os/agents-core`
- `agents-mono/os/agents-manager`
- `agents-mono/os/agents-harness`
- `agents-mono/os/llm-gateway`
- `agents-mono/os/inference-engine`
- `agents-mono/os/agents-plugin`
- `agents-mono/plugins/dream`
- `agents-mono/skills`
- `agents-mono/templates/darkfactory-templates`
- `agents-mono/workspaces/workspace-darkfactory`

## Migrated

- `experience` was migrated into the Rommie plugin and is no longer a profile workspace submodule.
- Andromeda wiki and research material was moved into `agents-mono/workspaces` under
  `andromeda/wiki` and `andromeda/research` as part of workspace consolidation.
- The former plugin repo was renamed to `agents-plugin` and lives at `agents-mono/os/agents-plugin`.
- The former Andromeda harness repo was renamed to `agents-harness` and lives at `agents-mono/os/agents-harness`.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
