# Repository Map

Live inventory of repositories owned by `marius-patrik`, refreshed on 2026-09-19.
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
| `DarkFactory` | `marius-patrik/DarkFactory` | Public | `darkfactory` |
| `DarkFactory-Paper` | `marius-patrik/DarkFactory-Paper` | Public | `main` |
| `dsh-stack` | `marius-patrik/dsh-stack` | Public | `main` |
| `MediaStream` | `marius-patrik/MediaStream` | Public | `main` |
| `MoneyMaker` | `marius-patrik/MoneyMaker` | Public | `main` |
| `omnis` | `marius-patrik/omnis` | Public | `main` |
| `PersonalCode` | `marius-patrik/PersonalCode` | Public | `dev` |
| `SkyAgent` | `marius-patrik/SkyAgent` | Public | `main` |
| `super-orca` | `marius-patrik/super-orca` | Public | `main` |
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

## Template repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `_templates/template-agent-mcp` | `marius-patrik/template-agent-mcp` | Public | `main` |
| `_templates/template-agent-monorepo` | `marius-patrik/template-agent-monorepo` | Public | `main` |
| `_templates/template-agent-plugin` | `marius-patrik/template-agent-plugin` | Public | `main` |
| `_templates/template-go-api` | `marius-patrik/template-go-api` | Public | `main` |
| `_templates/template-go-cli` | `marius-patrik/template-go-cli` | Public | `main` |
| `_templates/template-go-lib` | `marius-patrik/template-go-lib` | Public | `main` |
| `_templates/template-go-tui` | `marius-patrik/template-go-tui` | Public | `main` |
| `_templates/template-native` | `marius-patrik/template-native` | Public | `main` |
| `_templates/template-py-api` | `marius-patrik/template-py-api` | Public | `main` |
| `_templates/template-py-cli` | `marius-patrik/template-py-cli` | Public | `main` |
| `_templates/template-py-lib` | `marius-patrik/template-py-lib` | Public | `main` |
| `_templates/template-py-ml` | `marius-patrik/template-py-ml` | Public | `main` |
| `_templates/template-ts-cli` | `marius-patrik/template-ts-cli` | Public | `main` |
| `_templates/template-ts-lib` | `marius-patrik/template-ts-lib` | Public | `main` |
| `_templates/template-ts-monorepo` | `marius-patrik/template-ts-monorepo` | Public | `main` |
| `_templates/template-ts-tui` | `marius-patrik/template-ts-tui` | Public | `main` |
| `_templates/template-web-app` | `marius-patrik/template-web-app` | Public | `main` |
| `_templates/templates-super` | `marius-patrik/templates-super` | Public | `main` |

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
