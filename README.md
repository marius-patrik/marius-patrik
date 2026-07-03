# Patrik Marius

Profile workspace checkout for `marius-patrik`.

This repository tracks current `marius-patrik` repositories as a flat root-level
Git submodule list. Archived repositories are the only grouped submodules and
live under `archive/`. Local files outside the workspace manifest are ignored by
default.

`agent-os` can own its own internal package checkouts, but the profile workspace
keeps its repository list flat.

## Workspace Layout

```text
.
|-- agent-harness/
|-- agent-os/
|-- Fabrica/
|-- media-streamer/
|-- mssgs/
|-- private/
|-- singularity/
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
- `singularity`
- `vsc-utils`
- `yacht`

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
