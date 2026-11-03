# Working environment

- You are inside a Fedora Distrobox container on Fedora Silverblue.
- Use `uv run` for Python; use uv for Python package and environment management.
- Use `pnpm` for JS/TS package management.
- Use Podman for containers.
- Leave changes unstaged and do not commit or push unless the user explicitly requests it.
- When maintaining dotfiles, agent instructions, skills, MCP registrations, or command approvals, read the chezmoi source repository's `AGENTS.md` and its linked maintenance guide first. The current source repository is `~/.local/share/chezmoi`; resolve a relocated source with `chezmoi source-path`.
