# Patrik Marius

Builder of agent systems, research tooling, automation workflows, and experimental software.

This profile repository is also my root workspace. The `agents` submodule contains the agent-focused projects, while the remaining repositories live next to it at the root level as separate submodules.

## Workspace layout

- `agents` — parent workspace for agent-related repositories.
- `mmo` — MMO project.
- `rommie` — personal overseer / coordination agent repository.
- `rscode` — React RS Build IDE.
- `fabrica` — Fabrica project.
- `wrkspace` — workspace repository.
- `darkfactory-managed-smoke` — managed smoke test repository.

Private submodules require GitHub access to clone or fetch their contents.

## Clone workspace

```bash
git clone --recurse-submodules https://github.com/marius-patrik/marius-patrik.git
cd marius-patrik
git submodule update --init --recursive
```
