# Project Map

Active GitHub repositories are tracked as profile submodules. The profile root is
a flat active-repository list except for archived repositories under `archive/`.
Agentos owns managed agent, app, harness, template, and private workspace
submodules below `agentos/`.

## Workspace

| Path | Repository | Role |
| --- | --- | --- |
| `.` | `marius-patrik/marius-patrik` | Profile workspace and project map. |

## Active Root Repositories

| Path | Repository | Role |
| --- | --- | --- |
| `agentos` | `marius-patrik/agentos` | Agentos workspace, package manager, shared contracts, gateway, inference, and managed repo tree. |
| `andromeda-harness` | `marius-patrik/andromeda-harness` | Thin Andromeda runtime harness managed by Agentos. |
| `Fabrica` | `marius-patrik/Fabrica` | Fabrica project workspace. |
| `media-streamer` | `marius-patrik/media-streamer` | Media streamer project workspace. |
| `mssgs` | `marius-patrik/mssgs` | Unified messaging project workspace. |
| `vsc-utils` | `marius-patrik/vsc-utils` | VS Code utility project workspace. |
| `yacht` | `marius-patrik/yacht` | Private yacht project workspace. |

## Agentos Agents

| Path | Repository | Role |
| --- | --- | --- |
| `agentos/agents/dark-factory` | `marius-patrik/dark-factory` | GitHub App automation agent. |
| `agentos/agents/life-support` | `marius-patrik/life-support` | Private life-support agent package. |
| `agentos/agents/rommie-agent` | `marius-patrik/rommie-agent` | Rommie Codex plugin and agent package. |
| `agentos/agents/skyblock-agent` | `marius-patrik/skyblock-agent` | SkyBlock Agent package. |

## Agentos Apps And Harnesses

| Path | Repository | Role |
| --- | --- | --- |
| `agentos/apps/singularity` | `marius-patrik/singularity` | Singularity app workspace. |
| `agentos/harnesses/andromeda-harness` | `marius-patrik/andromeda-harness` | Nested managed Andromeda harness pointer for Agentos runtime orchestration. |

## Agentos Packages

| Path | Repository | Role |
| --- | --- | --- |
| `agentos/packages/agentos-core` | `marius-patrik/agentos` | Shared protobuf contracts, generated clients, schemas, and package manifests. |
| `agentos/packages/agentos-gateway` | `marius-patrik/agentos` | Gateway/router package migrated from Andromeda, including OAuth, registry, quota, and tests. |
| `agentos/packages/agentos-inferer` | `marius-patrik/agentos` | Inference engine, daemon, coordination, manager, statesync, Python agent, and self-improve packages migrated from Andromeda. |
| `agentos/packages/agentos-manager` | `marius-patrik/agentos` | Agentos package-manager CLI. |

## Agentos Templates And Workspace

| Path | Repository | Role |
| --- | --- | --- |
| `agentos/templates/template-bot` | `marius-patrik/template-bot` | Managed bot repository template. |
| `agentos/templates/template-cli` | `marius-patrik/template-cli` | Managed CLI repository template. |
| `agentos/templates/template-mono` | `marius-patrik/template-mono` | Managed monorepo template. |
| `agentos/templates/template-repo` | `marius-patrik/template-repo` | Bun TypeScript managed repository template. |
| `agentos/templates/template-web` | `marius-patrik/template-web` | Managed web app repository template. |
| `agentos/workspace` | `marius-patrik/agentos-workspace` | Private Agentos workspace repository, including `andromeda/wiki` and `andromeda/research`. |

## Migrated

| Former Path | Repository | Current Home |
| --- | --- | --- |
| `experience` | `marius-patrik/experience` | `agentos/agents/rommie-agent` |

## Archive

| Path | Repository | State |
| --- | --- | --- |
| `archive/Citizen` | `marius-patrik/Citizen` | Archived. |
| `archive/MMO` | `marius-patrik/MMO` | Archived. |
| `archive/RSCode` | `marius-patrik/RSCode` | Archived. |
| `archive/Wrkspace` | `marius-patrik/Wrkspace` | Archived. |
