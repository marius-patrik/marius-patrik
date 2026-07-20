# Hi there, I'm Patrik Marius 👋

Systems Architect & AI Engineer building **Agent OS runtimes**, **developmental intelligence systems**, and **autonomous multi-agent protocols**.

---

### 🚀 Featured Ecosystem

#### 🌌 [Andromeda](https://github.com/marius-patrik/Andromeda)
> **Agent OS Product & Control Plane**
> An integrated Agent OS monorepo powering autonomous agent execution, protocol wrappers, server deployment, CLI, and client runtimes. Features a unified protocol layer absorbing MCP, fail-closed state validation, and cross-machine event synchronization.
>
> Andromeda now carries what were once separate runtimes — the developmental AI substrate, the inference engine, the LLM gateway, the agent harness, and the workspace substrate — folded in with their full history under `src/migrate`, to be reimplemented against the SDK rather than maintained in place.

#### 🤖 [DarkFactory](https://github.com/marius-patrik/DarkFactory)
> **Autonomous Repository Agent**
> GitHub App automation agent managing repository setup, automated code reviews, continuous policy enforcement, and autonomous maintenance gates. Runs as the protected control plane for managed repositories, and is carried inside Andromeda as an agent project.

---

### 🛠️ Architecture & Tech Stack

```text
  +-------------------------------------------------------------------+
  |                           Andromeda OS                            |
  |   +-------------+  +-------------+  +-------------+  +----------+  |
  |   |   SDK Core  |  |  Protocol   |  |   Server    |  | Clients  |  |
  |   |  (Types/Ctx)|  | (MCP/Events)|  | (Deployment)|  | (CLI/Web)|  |
  |   +-------------+  +-------------+  +-------------+  +----------+  |
  +-------------------------------------------------------------------+
                                  ^
                                  |
                        +-----------------+
                        |   DarkFactory   |
                        |  (Automation)   |
                        +-----------------+
```

- **Languages**: TypeScript, JavaScript (Bun/Node), Python, Go, Rust, HTML/CSS
- **Runtimes & Frameworks**: Bun, Node.js, React, Tauri, PyTorch/SQLite
- **Protocols & Standards**: Model Context Protocol (MCP), Event Journaling, JSON-RPC, REST
- **Specializations**: Autonomous Agent Swarms, State Doctoring & Self-Healing, Reversible Memory Synthesis, Fail-Closed CI Gates

---

### 🌐 Repository Inventory

This umbrella repository tracks my project ecosystem as gitlinks:

- **Active public repositories** at the root — `Andromeda`, `DarkFactory`, `SkyAgent`, `MediaStream`, and others.
- **Active private repositories** under `private/` — including `private-data`, the Agent OS state repository.
- **Archived repositories** under `archive/`, with private archives under `archive/private/`.

*Full map, visibility matrix, and default-branch index are maintained in [`PROJECTS.md`](PROJECTS.md).*

---

### 📐 What this repository is, and is not

This umbrella repository is a **workspace index, not a package or product**. It owns
exactly three things: the workspace layout, the submodule pointers, and the
project-map documentation.

It deliberately has no root package manifest, no installer, and no user-facing
artifact. Build, test, installer, and release validation belong to the nested
repositories that own that code — the umbrella never duplicates them.

Its CI validates only what it owns: that `.gitmodules` parses, that every declared
submodule is a real gitlink and every gitlink is declared, and that `PROJECTS.md`
documents exactly the submodules that exist. A stale project map fails the build.

For the same reason the umbrella is **formally exempt from the DarkFactory managed
enforcement baseline**, which targets product repositories with their own build and
release surface. Managed workflows, review gates, and policy files are installed in
the repositories that actually ship something.

---

<p align="center">
  <i>Building the substrate for autonomous, self-evolving AI systems.</i>
</p>
