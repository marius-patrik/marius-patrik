# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as root-level Git
submodules. Archived repositories are grouped under `archive/`, and `agent-os`
owns its managed package submodules under `agent-os/packages/`. Local files
outside the workspace manifest are ignored by default.

`singularity` is managed by `agent-os` at `agent-os/packages/singularity`.

## Workspace Layout

```text
.
|-- agent-harness/
|-- agent-os/
|   `-- packages/
|       `-- singularity/
|-- Fabrica/
|-- media-streamer/
|-- mssgs/
|-- private/
|-- vsc-utils/
|-- yacht/
`-- archive/
    |-- Citizen/
    |-- MMO/
    |-- RSCode/
    `-- Wrkspace/
```

See [PROJECTS.md](PROJECTS.md) for the GitHub repository map.

## Root Repositories

- `agent-harness`
- `agent-os`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `private`
- `vsc-utils`
- `yacht`

## Agent OS Packages

- `agent-os/packages/singularity`

## Migrated

- `experience` was migrated into `agent-harness` as Rommie and is no longer a
  profile workspace submodule.

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
