# Patrik Marius

Canonical profile workspace and repository inventory for
[`marius-patrik`](https://github.com/marius-patrik).

This repository tracks every other repository owned by the account as a gitlink:

- active public repositories live at the root using their exact GitHub names;
- active private repositories live under `private/`;
- archived public repositories live under `archive/`;
- archived private repositories live under `private/archive/`;
- each gitlink points to the current head of that repository's default branch at the time
  this inventory is refreshed;
- child repositories are not modified by an inventory refresh.

The current snapshot contains 20 active and 10 archived repositories. Use
[`PROJECTS.md`](PROJECTS.md) for the complete map, visibility, and default branches.

## Primary systems

- [`Andromeda`](https://github.com/marius-patrik/Andromeda) - integrated Agent OS product
  and control plane.
- [`Andromeda-data`](https://github.com/marius-patrik/Andromeda-data) - private Agent OS
  data authority.
- [`DarkFactory`](https://github.com/marius-patrik/DarkFactory) - repository automation
  agent.
- [`genesis-os`](https://github.com/marius-patrik/genesis-os) - developmental
  intelligence, continual-learning, and model-lineage substrate.
- [`experience`](https://github.com/marius-patrik/experience) - Codex memory and
  continuity plugin.
- [`SkyAgent`](https://github.com/marius-patrik/SkyAgent) - Hypixel SkyBlock agent.

## Checkout policy

The umbrella is an inventory first. Submodules may remain deinitialized and can be checked
out on demand:

```powershell
git submodule update --init -- <path>
```

To initialize everything, including archived repositories:

```powershell
git submodule update --init --recursive
```
