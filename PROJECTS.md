# Repository Map

Live inventory of repositories owned by `marius-patrik`, refreshed on 2026-09-04.
Paths match the umbrella `.gitmodules` file. The umbrella repository itself is
omitted from the gitlink tables.

This repository is a workspace index, not a product: it owns submodule pointers
and this map. Build, test, and release validation belongs to the nested
repositories. `scripts/verify-umbrella.mjs` fails the build if this table and
`.gitmodules` disagree.

Layout rule: archived repositories always live under `archive/`; active
repositories never do.

## Active repositories

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `data-agents` | `marius-patrik/data-agents` | Private | `main` |
| `agents-super` | `marius-patrik/agents-super` | Private | `main` |
| `ChessWithQuests` | `marius-patrik/ChessWithQuests` | Public | `main` |
| `Citizen` | `marius-patrik/Citizen` | Private | `main` |
| `DarkFactory` | `marius-patrik/DarkFactory` | Public | `main` |
| `dsh-stack` | `marius-patrik/dsh-stack` | Public | `main` |
| `Fabrica` | `marius-patrik/Fabrica` | Private | `dev` |
| `MediaStream` | `marius-patrik/MediaStream` | Public | `main` |
| `MMO` | `marius-patrik/MMO` | Private | `main` |
| `MoneyMaker` | `marius-patrik/MoneyMaker` | Public | `main` |
| `PersonalCode` | `marius-patrik/PersonalCode` | Public | `dev` |
| `data-private` | `marius-patrik/data-private` | Private | `main` |
| `SkyAgent` | `marius-patrik/SkyAgent` | Public | `main` |
| `singularity` | `marius-patrik/singularity` | Public | `main` |
| `TransparentPhone` | `marius-patrik/TransparentPhone` | Public | `main` |

## Archived repositories

Read-only evidence. Archived repositories are never revived in place; work
that matters is folded into an active repository first.

| Path | Repository | Visibility | Default branch |
| --- | --- | --- | --- |
| `archive/Andromeda` | `marius-patrik/Andromeda` | Private | `main` |
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
| `archive/Wrkspace` | `marius-patrik/Wrkspace` | Public | `main` |
| `archive/yacht` | `marius-patrik/yacht` | Private | `main` |
