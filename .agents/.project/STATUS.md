# Status

- The 2026-07-19 live-account refresh records 30 child repositories: 20 active and
  10 archived.
- `genesis-os` is tracked as an active public `main`-branch gitlink pinned to
  `12b3713564024ee06042b0f4818a9a935bf06507`.
- At each refresh snapshot, every gitlink points to the then-current head of its
  repository's live default branch; operational data repositories may advance after
  the snapshot is published.
- `darkfactory-templates`, `Experience`, and the four `template-*` repositories are
  active again; `dream` and `Rommie` are archived.
- Four stale inventory entries whose repositories no longer exist on the account were
  removed: `agents-core`, `data-agentos`, `workspace-agents`, and
  `workspace-darkfactory`.
- Repository renames are reflected exactly in the umbrella paths and URLs:
  `tmux-agent-status` is now `StatusLine`, `media-streamer` is now `MediaStream`,
  `life-support` is now `LifeQuest`, `singularity` is now `Singularity`, and
  `experience` is now `Experience`.
- Umbrella autoreview uses an immutable, SHA-verified control plane with
  credential-isolated Kimi takeover for Codex provider/auth limits.
