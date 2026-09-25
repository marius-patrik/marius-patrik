# Repository Map

Live inventory of repositories owned by `marius-patrik`, refreshed on 2026-09-25.
Paths match the umbrella `.gitmodules` file. The umbrella repository itself is
omitted from the gitlink tables.

This repository is a workspace index, not a product: it owns submodule pointers
and this map. Build, test, and release validation belongs to the nested
repositories. `.github/scripts/verify-umbrella.mjs` fails the build if this table and
`.gitmodules` disagree.

Layout rules:
- Archived repositories live under `_archive/`.
- Private repositories (active) live under `_private/`.
- Template repositories live under `_templates/`.
- Active public repositories live at the root.

## Active repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `ChessWithQuests` | `marius-patrik/ChessWithQuests` | Public | `main` |
| `DarkFactory` | `marius-patrik/DarkFactory` | Public | `main` |
| `TransparentPhone` | `marius-patrik/TransparentPhone` | Public | `main` |
| `vsc-utils` | `marius-patrik/vsc-utils` | Public | `main` |

## Private repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `_private/data-agents` | `marius-patrik/data-agents` | Private | `main` |
| `_private/data-claude` | `marius-patrik/data-claude` | Private | `main` |
| `_private/data-codex` | `marius-patrik/data-codex` | Private | `main` |
| `_private/data-cursor` | `marius-patrik/data-cursor` | Private | `main` |
| `_private/data-gemini` | `marius-patrik/data-gemini` | Private | `main` |
| `_private/data-grok` | `marius-patrik/data-grok` | Private | `main` |
| `_private/data-kimi` | `marius-patrik/data-kimi` | Private | `main` |
| `_private/data-tax` | `marius-patrik/data-tax` | Private | `main` |

## Archived repositories

Read-only evidence. Archived repositories are never revived in place; work
that matters is folded into an active repository first.

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `_archive/accumulative-matrix-sweeping` | `marius-patrik/accumulative-matrix-sweeping` | Private | `main` |
| `_archive/agents-super` | `marius-patrik/agents-super` | Private | `main` |
| `_archive/Andromeda` | `marius-patrik/Andromeda` | Private | `main` |
| `_archive/Citizen` | `marius-patrik/Citizen` | Private | `main` |
| `_archive/DarkFactory-old` | `marius-patrik/DarkFactory-old` | Private | `main` |
| `_archive/DarkFactory-Paper` | `marius-patrik/DarkFactory-Paper` | Private | `main` |
| `_archive/MediaStream` | `marius-patrik/MediaStream` | Private | `main` |
| `_archive/MoneyMaker` | `marius-patrik/MoneyMaker` | Private | `main` |
| `_archive/omnis` | `marius-patrik/omnis` | Private | `main` |
| `_archive/PersonalCode` | `marius-patrik/PersonalCode` | Private | `dev` |
| `_archive/SkyAgent` | `marius-patrik/SkyAgent` | Private | `main` |
| `_archive/super-orca` | `marius-patrik/super-orca` | Private | `main` |
| `_archive/dsh-stack` | `marius-patrik/dsh-stack` | Private | `main` |
| `_archive/template-agent-mcp` | `marius-patrik/template-agent-mcp` | Private | `main` |
| `_archive/template-agent-monorepo` | `marius-patrik/template-agent-monorepo` | Private | `main` |
| `_archive/template-agent-plugin` | `marius-patrik/template-agent-plugin` | Private | `main` |
| `_archive/template-go-api` | `marius-patrik/template-go-api` | Private | `main` |
| `_archive/template-go-cli` | `marius-patrik/template-go-cli` | Private | `main` |
| `_archive/template-go-lib` | `marius-patrik/template-go-lib` | Private | `main` |
| `_archive/template-go-tui` | `marius-patrik/template-go-tui` | Private | `main` |
| `_archive/template-native` | `marius-patrik/template-native` | Private | `main` |
| `_archive/template-py-api` | `marius-patrik/template-py-api` | Private | `main` |
| `_archive/template-py-cli` | `marius-patrik/template-py-cli` | Private | `main` |
| `_archive/template-py-lib` | `marius-patrik/template-py-lib` | Private | `main` |
| `_archive/template-py-ml` | `marius-patrik/template-py-ml` | Private | `main` |
| `_archive/template-ts-cli` | `marius-patrik/template-ts-cli` | Private | `main` |
| `_archive/template-ts-lib` | `marius-patrik/template-ts-lib` | Private | `main` |
| `_archive/template-ts-monorepo` | `marius-patrik/template-ts-monorepo` | Private | `main` |
| `_archive/template-ts-tui` | `marius-patrik/template-ts-tui` | Private | `main` |
| `_archive/template-web-app` | `marius-patrik/template-web-app` | Private | `main` |
| `_archive/templates-super` | `marius-patrik/templates-super` | Private | `main` |
| `_archive/Fabrica` | `marius-patrik/Fabrica` | Private | `dev` |
| `_archive/froq` | `marius-patrik/froq` | Private | `main` |
| `_archive/genesis-os` | `marius-patrik/genesis-os` | Private | `main` |
| `_archive/LifeQuest` | `marius-patrik/LifeQuest` | Private | `main` |
| `_archive/life-support` | `marius-patrik/life-support` | Private | `main` |
| `_archive/livequest` | `marius-patrik/livequest` | Private | `main` |
| `_archive/Memory` | `marius-patrik/Memory` | Private | `main` |
| `_archive/messenger` | `marius-patrik/messenger` | Private | `main` |
| `_archive/MMO` | `marius-patrik/MMO` | Private | `main` |
| `_archive/mssgs` | `marius-patrik/mssgs` | Private | `main` |
| `_archive/OdbornaPrace-mono` | `marius-patrik/OdbornaPrace-mono` | Private | `main` |
| `_archive/paes` | `marius-patrik/paes` | Private | `main` |
| `_archive/PAES-enterprise` | `marius-patrik/PAES-enterprise` | Private | `main` |
| `_archive/Rommie` | `marius-patrik/Rommie` | Private | `main` |
| `_archive/RSCode` | `marius-patrik/RSCode` | Private | `main` |
| `_archive/singularity` | `marius-patrik/singularity` | Private | `main` |
| `_archive/StatusLine` | `marius-patrik/StatusLine` | Private | `master` |
| `_archive/template-OdbornaPrace` | `marius-patrik/template-OdbornaPrace` | Private | `main` |
| `_archive/Wrkspace` | `marius-patrik/Wrkspace` | Private | `main` |
| `_archive/yacht` | `marius-patrik/yacht` | Private | `main` |
