# Patrik Marius

Root workspace checkout for `marius-patrik`.

This repository tracks the current `marius-patrik` repositories as a nested Git
submodule workspace. Local files outside the workspace manifest are ignored by
default.

`avatars` is the active agent package-manager workspace. It replaces the old
`agents` package-manager name and owns agent repositories under
`avatars/agents/*`. SkyAgent is tracked by the `skye` repository there.

## Workspace Layout

```text
.
|-- avatars/
|   `-- agents/
|       |-- andromeda/
|       |-- personal-assistant/
|       |-- skye/
|       `-- vibe-bot/
|-- templates/
|   |-- template-bot/
|   |-- template-cli/
|   |-- template-mono/
|   |-- template-repo/
|   `-- template-web/
`-- archive/
    |-- Citizen/
    |-- MMO/
    |-- RSCode/
    `-- Wrkspace/
```

See [PROJECTS.md](PROJECTS.md) for the GitHub repository map.

## Root Repositories

- `andromeda`
- `avatars`
- `experience`
- `Fabrica`
- `media-streamer`
- `mssgs`
- `private`
- `singularity`
- `vsc-utils`
- `yacht`

## Agent Repositories

Agent repositories are nested inside `avatars` and should not be duplicated at
the workspace root.

- `avatars/agents/andromeda`
- `avatars/agents/personal-assistant`
- `avatars/agents/skye`
- `avatars/agents/vibe-bot`

## Templates

- `templates/template-bot`
- `templates/template-cli`
- `templates/template-mono`
- `templates/template-repo`
- `templates/template-web`

## Archived

These repositories are parked and should not be used for active work unless they
are explicitly reopened.

- `archive/Citizen`
- `archive/MMO`
- `archive/RSCode`
- `archive/Wrkspace`
