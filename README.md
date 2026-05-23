# Patrik Marius

Builder of agent systems, research tooling, automation workflows, and experimental software.

This profile repository is also my root workspace. It tracks each owned repository as a top-level Git submodule pinned to the latest commit on that repository's default branch at the time of update.

## Workspace layout

- `citizen` — Citizen repository, tracking `main`.
- `darkfactory` — DarkFactory repository, tracking `develop`.
- `fabrica` — Fabrica repository, tracking `dev`.
- `mmo` — MMO project, tracking `main`.
- `rommie` — Rommie repository, tracking `dev`.
- `rscode` — React RS Build IDE, tracking `main`.
- `true-qft-autoresearch` — true-qft-autoresearch repository, tracking `main`.
- `wrkspace` — workspace repository, tracking `main`.

Private submodules require GitHub access to clone or fetch their contents. Archived repositories are still included so this root workspace remains complete.

## Clone workspace

```bash
git clone --recurse-submodules https://github.com/marius-patrik/marius-patrik.git
cd marius-patrik
git submodule update --init --recursive
```

## Refresh submodules

```bash
git submodule update --remote --merge --recursive
```
