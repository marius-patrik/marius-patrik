# Project Map

Active GitHub repositories are tracked as profile submodules. The profile root is
a flat active-repository list except for archived repositories under `archive/`.
Agentos owns managed agent, app, harness, template, data, plugin, and private
workspace submodules below `agents-mono/`.

## Workspace

| Path | Repository | Role |
| --- | --- | --- |
| `.` | `marius-patrik/marius-patrik` | Profile workspace and project map. |

## Active Root Repositories

| Path | Repository | Role |
| --- | --- | --- |
| `agents-mono` | `marius-patrik/agents-mono` | Agents-OS workspace, package manager, shared contracts, gateway, inference, and managed repo tree. |
| `andromeda-harness` | `marius-patrik/andromeda-harness` | Thin Andromeda runtime harness managed by AgentOS. |
| `Fabrica` | `marius-patrik/Fabrica` | Fabrica project workspace. |
| `media-streamer` | `marius-patrik/media-streamer` | Media streamer project workspace. |
| `mssgs` | `marius-patrik/mssgs` | Unified messaging project workspace. |
| `vsc-utils` | `marius-patrik/vsc-utils` | VS Code utility project workspace. |
| `yacht` | `marius-patrik/yacht` | Private yacht project workspace. |

## Agentos Agents

| Path | Repository | Role |
| --- | --- | --- |
| `agents-mono/agents/darkfactory-agent` | `marius-patrik/darkfactory-agent` | GitHub App automation agent. |
| `agents-mono/agents/life-support` | `marius-patrik/life-support` | Private life-support agent package. |
| `agents-mono/plugins/andromeda` | `marius-patrik/rommie-agent` | Andromeda Codex plugin package. |
| `agents-mono/agents/skyblock-agent` | `marius-patrik/skyblock-agent` | SkyBlock Agent package. |

## Agentos Apps, Harnesses, and Templates

| Path | Repository | Role |
| --- | --- | --- |
| `agents-mono/apps/fabrica` | `marius-patrik/Fabrica` | Managed Fabrica app workspace. |
| `agents-mono/apps/singularity` | `marius-patrik/singularity` | Singularity app workspace. |
| `agents-mono/harnesses/andromeda-harness` | `marius-patrik/andromeda-harness` | Managed Andromeda harness runtime package. |
| `agents-mono/templates/darkfactory-templates` | `marius-patrik/darkfactory-templates` | Bun templates monorepo with managed templates. |

## Agentos Packages

| Path | Repository | Role |
| --- | --- | --- |
| `agents-mono/packages/agentos-core` | `marius-patrik/agents-mono` | Shared protobuf contracts, generated clients, schemas, and package manifests. |
| `agents-mono/packages/llm-gateway` | `marius-patrik/agents-mono` | Gateway/router package migrated from Andromeda, including OAuth, registry, quota, and tests. |
| `agents-mono/packages/inference-engine` | `marius-patrik/agents-mono` | Inference engine, daemon, coordination, manager, state-sync, Python agent, and self-improve packages migrated from Andromeda. |
| `agents-mono/packages/agents-manager` | `marius-patrik/agents-mono` | Agents-OS package-manager CLI. |

## Agentos Data, Workspace, Plugin, and Managed Repository Map

| Path | Repository | Role |
| --- | --- | --- |
| `agents-mono/packages/data/data-agentos` | `marius-patrik/agentos-data` | Managed data root for agent and workspace package data. |
| `agents-mono/packages/plugins/dream` | `marius-patrik/dream` | Managed Dream plugin package. |
| `agents-mono/packages/workspaces/darkfactory-workspace` | `marius-patrik/darkfactory-workspace` | DarkFactory workspace package. |

## Migrated

| Former Path | Repository | Current Home |
| --- | --- | --- |
| `experience` | `marius-patrik/experience` | `agents-mono/plugins/andromeda` |

## Archive

| Path | Repository | State |
| --- | --- | --- |
| `archive/Citizen` | `marius-patrik/Citizen` | Archived. |
| `archive/MMO` | `marius-patrik/MMO` | Archived. |
| `archive/RSCode` | `marius-patrik/RSCode` | Archived. |
| `archive/Wrkspace` | `marius-patrik/Wrkspace` | Archived. |



