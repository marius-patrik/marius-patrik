# Repository Map

Live inventory of repositories owned by `marius-patrik`, refreshed on 2026-09-13.
Paths match the umbrella `.gitmodules` file. The umbrella repository itself is
omitted from the gitlink tables.

This repository is a workspace index, not a product: it owns submodule pointers
and this map. Build, test, and release validation belongs to the nested
repositories. `.github/scripts/verify-umbrella.mjs` fails the build if this table and
`.gitmodules` disagree.

Layout rules:
- Archived repositories live under `archive/`.
- Private repositories (active) live under `private/`.
- Template repositories live under `templates/`.
- Active public repositories live at the root.

## Active repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `accumulative-matrix-sweeping` | `marius-patrik/accumulative-matrix-sweeping` | Public | `main` |
| `ChessWithQuests` | `marius-patrik/ChessWithQuests` | Public | `main` |
| `DarkFactory` | `marius-patrik/DarkFactory` | Public | `darkfactory` |
| `dsh-stack` | `marius-patrik/dsh-stack` | Public | `main` |
| `genesis-os` | `marius-patrik/genesis-os` | Public | `main` |
| `livequest` | `marius-patrik/livequest` | Public | `main` |
| `MediaStream` | `marius-patrik/MediaStream` | Public | `main` |
| `Memory` | `marius-patrik/Memory` | Public | `main` |
| `MoneyMaker` | `marius-patrik/MoneyMaker` | Public | `main` |
| `mono-OdbornaPrace` | `marius-patrik/mono-OdbornaPrace` | Public | `main` |
| `OdbornaPrace` | `marius-patrik/OdbornaPrace` | Public | `main` |
| `omnis` | `marius-patrik/omnis` | Public | `main` |
| `PersonalCode` | `marius-patrik/PersonalCode` | Public | `dev` |
| `singularity` | `marius-patrik/singularity` | Public | `main` |
| `SkyAgent` | `marius-patrik/SkyAgent` | Public | `main` |
| `super-orca` | `marius-patrik/super-orca` | Public | `main` |
| `TransparentPhone` | `marius-patrik/TransparentPhone` | Public | `main` |

## Private repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `private/agents-super` | `marius-patrik/agents-super` | Private | `main` |
| `private/Citizen` | `marius-patrik/Citizen` | Private | `main` |
| `private/data-agents` | `marius-patrik/data-agents` | Private | `main` |
| `private/data-claude` | `marius-patrik/data-claude` | Private | `main` |
| `private/Fabrica` | `marius-patrik/Fabrica` | Private | `dev` |
| `private/MMO` | `marius-patrik/MMO` | Private | `main` |
| `private/PAES-enterprise` | `marius-patrik/PAES-enterprise` | Private | `main` |
| `private/tax-archive` | `marius-patrik/tax-archive` | Private | `main` |

## Template repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `templates/template-agent-mcp` | `marius-patrik/template-agent-mcp` | Public | `main` |
| `templates/template-agent-monorepo` | `marius-patrik/template-agent-monorepo` | Public | `main` |
| `templates/template-agent-plugin` | `marius-patrik/template-agent-plugin` | Public | `main` |
| `templates/template-go-api` | `marius-patrik/template-go-api` | Public | `main` |
| `templates/template-go-cli` | `marius-patrik/template-go-cli` | Public | `main` |
| `templates/template-go-lib` | `marius-patrik/template-go-lib` | Public | `main` |
| `templates/template-go-tui` | `marius-patrik/template-go-tui` | Public | `main` |
| `templates/template-native` | `marius-patrik/template-native` | Public | `main` |
| `templates/template-OdbornaPrace` | `marius-patrik/template-OdbornaPrace` | Public | `main` |
| `templates/template-py-api` | `marius-patrik/template-py-api` | Public | `main` |
| `templates/template-py-cli` | `marius-patrik/template-py-cli` | Public | `main` |
| `templates/template-py-lib` | `marius-patrik/template-py-lib` | Public | `main` |
| `templates/template-py-ml` | `marius-patrik/template-py-ml` | Public | `main` |
| `templates/templates-super` | `marius-patrik/templates-super` | Public | `main` |
| `templates/template-ts-cli` | `marius-patrik/template-ts-cli` | Public | `main` |
| `templates/template-ts-lib` | `marius-patrik/template-ts-lib` | Public | `main` |
| `templates/template-ts-monorepo` | `marius-patrik/template-ts-monorepo` | Public | `main` |
| `templates/template-ts-tui` | `marius-patrik/template-ts-tui` | Public | `main` |
| `templates/template-web-app` | `marius-patrik/template-web-app` | Public | `main` |

## Archived repositories

Read-only evidence. Archived repositories are never revived in place; work
that matters is folded into an active repository first.

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `archive/Andromeda` | `marius-patrik/Andromeda` | Private | `main` |
| `archive/DarkFactory-old` | `marius-patrik/DarkFactory-old` | Private | `main` |
| `archive/froq` | `marius-patrik/froq` | Private | `main` |
| `archive/LifeQuest` | `marius-patrik/LifeQuest` | Private | `main` |
| `archive/life-support` | `marius-patrik/life-support` | Private | `main` |
| `archive/messenger` | `marius-patrik/messenger` | Private | `main` |
| `archive/mssgs` | `marius-patrik/mssgs` | Private | `main` |
| `archive/paes` | `marius-patrik/paes` | Private | `main` |
| `archive/Rommie` | `marius-patrik/Rommie` | Private | `main` |
| `archive/RSCode` | `marius-patrik/RSCode` | Private | `main` |
| `archive/StatusLine` | `marius-patrik/StatusLine` | Private | `master` |
| `archive/vsc-utils` | `marius-patrik/vsc-utils` | Private | `main` |
| `archive/Wrkspace` | `marius-patrik/Wrkspace` | Private | `main` |
| `archive/yacht` | `marius-patrik/yacht` | Private | `main` |
