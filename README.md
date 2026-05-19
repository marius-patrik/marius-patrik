# Patrik Marius

Builder of agent systems, research tooling, automation workflows, and experimental software.

This profile repository is also my root workspace. The `Agent` submodule contains grouped agent and skill repositories, while the remaining non-agent repositories live next to it at the root level as separate submodules.

## Workspace layout

- `Agent` — parent workspace for agents and skills.
- `mmo` — MMO project.
- `rscode` — React RS Build IDE.
- `wrkspace` — workspace repository.

Private submodules require GitHub access to clone or fetch their contents.

## Clone workspace

```bash
git clone --recurse-submodules https://github.com/marius-patrik/marius-patrik.git
cd marius-patrik
git submodule update --init --recursive
```
