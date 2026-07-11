# Repository Map

Live inventory of repositories owned by `marius-patrik`. Paths match the umbrella
`.gitmodules` file. The umbrella repository itself is omitted from the gitlink tables.

## Active repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `Andromeda` | `marius-patrik/Andromeda` | Public | `main` |
| `DarkFactory` | `marius-patrik/DarkFactory` | Public | `main` |
| `Fabrica` | `marius-patrik/Fabrica` | Public | `dev` |
| `Rommie` | `marius-patrik/Rommie` | Private | `main` |
| `SkyAgent` | `marius-patrik/SkyAgent` | Public | `main` |
| `agents-plugin` | `marius-patrik/agents-plugin` | Public | `main` |
| `darkfactory-data` | `marius-patrik/darkfactory-data` | Private | `main` |
| `dream` | `marius-patrik/dream` | Public | `main` |
| `life-support` | `marius-patrik/life-support` | Public | `main` |
| `media-streamer` | `marius-patrik/media-streamer` | Public | `main` |
| `mssgs` | `marius-patrik/mssgs` | Public | `main` |
| `singularity` | `marius-patrik/singularity` | Public | `main` |
| `tmux-agent-status` | `marius-patrik/tmux-agent-status` | Public | `master` |
| `vsc-utils` | `marius-patrik/vsc-utils` | Public | `main` |
| `workspace-agents` | `marius-patrik/workspace-agents` | Public | `main` |
| `yacht` | `marius-patrik/yacht` | Private | `main` |

## Archived repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `archive/agents-core` | `marius-patrik/agents-core` | Public | `main` |
| `archive/agents-harness` | `marius-patrik/agents-harness` | Public | `main` |
| `archive/agents-manager-legacy` | `marius-patrik/agents-manager-legacy` | Public | `main` |
| `archive/Citizen` | `marius-patrik/Citizen` | Private | `main` |
| `archive/darkfactory-templates` | `marius-patrik/darkfactory-templates` | Public | `main` |
| `archive/data-agentos` | `marius-patrik/data-agentos` | Private | `main` |
| `archive/experience` | `marius-patrik/experience` | Public | `master` |
| `archive/inference-engine` | `marius-patrik/inference-engine` | Public | `main` |
| `archive/llm-gateway` | `marius-patrik/llm-gateway` | Public | `main` |
| `archive/MMO` | `marius-patrik/MMO` | Public | `main` |
| `archive/RSCode` | `marius-patrik/RSCode` | Public | `main` |
| `archive/template-bot` | `marius-patrik/template-bot` | Public | `main` |
| `archive/template-cli` | `marius-patrik/template-cli` | Public | `main` |
| `archive/template-repo` | `marius-patrik/template-repo` | Public | `main` |
| `archive/template-web` | `marius-patrik/template-web` | Public | `main` |
| `archive/workspace-darkfactory` | `marius-patrik/workspace-darkfactory` | Private | `main` |
| `archive/Wrkspace` | `marius-patrik/Wrkspace` | Public | `main` |

## Refresh contract

An inventory refresh must:

1. enumerate repositories from the live GitHub account;
2. classify them from GitHub's current `isArchived` value;
3. use each repository's exact name, visibility, and default branch;
4. pin each gitlink to the current default-branch commit;
5. exclude only `marius-patrik/marius-patrik` itself;
6. avoid changing child repository contents or branches.
