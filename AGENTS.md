# Dotfile maintenance

Read this file before reviewing drift, editing or deploying dotfiles, or maintaining skills and MCP configuration.

## Scope and Git

- Leave changes unstaged. Do not commit, push, create Git checkpoints, or rewrite history unless explicitly requested. Keep effective chezmoi `git.autoAdd`, `git.autoCommit`, and `git.autoPush` disabled.
- Record HEAD, index checksum, working-tree status, and relevant live-file drift before editing. Use `GIT_OPTIONAL_LOCKS=0` for read-only Git checks. Preserve unrelated changes and verify HEAD and index afterward.
- Review requests are read-only. Limit updates to requested components; do not install bundles, enable services, change authentication, or edit unrelated projects implicitly.
- Avoid scanning dependencies, vendor caches, and application history during routine maintenance. Do not archive removed third-party skill bundles.

## Ownership

- Chezmoi owns selected sources and deployment. Mise owns tool requests, tasks, and runtime environments. Use home-relative source names such as `dot_agents/`, `dot_codex/`, and `dot_config/`.
- This file is repository-only and excluded from deployment by `.chezmoiignore`. That file does not prevent Git publication.
- Shared runtime instructions live in `dot_agents/AGENTS.md`, deployed to `~/.agents/AGENTS.md`. Preserve existing client adapters and the home-level instruction link; do not deploy this repository's guidance over them.
- Manage selected configuration files, not whole application state directories. Editor settings and model selections remain owned by built-in sync. Keep MCP registrations separate.
- Shared Copilot MCP registrations belong in `~/.copilot/mcp-config.json`; do not recreate duplicate editor registrations for this setup.

## Private data and publication

- Treat the repository as public. Keep credentials encrypted with age, or outside the source tree. Never copy credentials into reports or documentation. `private_` controls permissions; it does not encrypt content.
- `.gitconfig` and `~/.agents/mise.local.toml` have encrypted sources and deploy with mode 0600. Refresh their ciphertext deliberately when live values change.
- Keep encryption identities, repository-unlock passwords, OAuth stores, login state, histories, caches, and local recovery artifacts outside the source set. Verify independent access to recovery credentials.
- Check plaintext sources and relevant Git history before publication. Local checkpoint refs can contain application state; do not publish them implicitly or use mirror pushes for this repository.

## Change and deployment workflow

1. Resolve each target with `chezmoi source-path <target>` and compare source and live contents. For new targets, inspect content and permissions before enrollment. Do not bulk re-add live files to hide drift.
2. Edit the source deliberately and preserve unrelated settings. For mixed configuration/state files, use supported separate configuration or document partial ownership. Retiring a source key does not necessarily remove a live key.
3. Inspect applicable scripts, hooks, templates, and external declarations. Run target-scoped `chezmoi diff` and `chezmoi apply --dry-run --verbose`. Keep applications that rewrite those targets closed during deployment. Do not print secret-bearing diffs.
4. Apply only reviewed targets with `chezmoi apply <target>...`. Retain or merge useful live changes deliberately; avoid blanket force applies. Removing a source does not delete its live target: use a reviewed one-time deletion unless persistent removal is intended.
5. Verify source/live equality for whole-file targets, owned fields for partial targets, permissions, and relevant application behavior. Validate isolated restore/reapply when changing templates or restore behavior. Report skipped drift and unverified behavior explicitly.

## Partial ownership

- `dot_codex/modify_private_config.toml` owns `approvals_reviewer` and its declared MCP subset. Other app preferences, project trust, onboarding, plugins, and generated registrations remain local. Inspect extra MCP and approval keys during reviews; preserving a key is not approval of it.
- `~/.claude/settings.json`, `~/.cursor/cli-config.json`, and `~/.omp/agent/config.yml` remain local and unmanaged because they change during normal client use. Keep their MCP registrations managed separately; do not enroll these settings files implicitly.
- Native approval and sandbox settings are separate from behavioral instructions. Do not add broad launcher/interpreter grants. Preserve read-only Kubernetes access and other intentionally restricted integrations.

## Mise and MCP

- Keep package requests and tasks in `~/.config/mise/config.toml`. MCP requests use `latest`; exact versions and dependency digests live in machine-local `mise.lock` and `.mise/locks/`, outside chezmoi.
- Store private MCP environment values in the encrypted `~/.agents/mise.local.toml` `[env]` block. Do not put task overrides there: they can shadow global tasks. There is no separate agents task configuration.
- Client launchers use `mise -C <absolute agents directory> run mcp:<name>` to load the private environment. Resolve the actual home directory when editing launchers; do not assume shell expansion in argument arrays.
- Tasks retain `raw = true` and `quiet = true`; global `task.run_auto_install = false` prevents startup installation. Keep protocol stdout free of diagnostics.
- For authorized MCP updates, run `mise lock --global --bump npm:<selected-package>`, review the local lock changes, then `mise install --locked npm:<selected-package>`. Do not upgrade unrelated tools.
- Before switching registrations, verify non-TTY initialization, tool listing, stdin/EOF shutdown, and relevant authenticated read-only behavior. Verify headless Playwright separately from optional headed or Chrome-attach modes. Keep repository browser tests separate from MCP setup.
- Verify discovery and tool menus in the actual client before claiming end-to-end success. CLI checks do not establish GUI behavior. Inspect duplicate registrations and plugin caches without deleting unrelated state.

## Bundled skills and optional integrations

- `dot_agents/skills/` owns shared skill copies; client adapters link to them. Use `dot_agents/dot_skill-lock.json` for provenance rather than duplicating version lists here.
- Update only requested skills from reviewed upstream sources in a temporary directory. Preserve invocation rules, executable modes, provenance, licenses, and the selected telemetry opt-out. Do not create competing physical copies or run broad skill updates.
- Skills installation does not authorize account operations, purchases, new authentication, or additional MCP registrations.

Use the repository-local `upgrade-agent-skills` skill for periodic checks and reviewed upgrades of the managed skill set. Its instructions live in `.agents/skills/upgrade-agent-skills/SKILL.md`. The repository's `.agents/` directory is excluded from chezmoi deployment.

## Backups

- `profiles.toml` is managed as an encrypted source. Resticprofile generates its systemd units during setup; do not enroll generated units.
- Keep retention and prune schedules in the profile. When changing schedules, regenerate and activate relevant timers, then verify actual state. Distinguish a generated unit from an active timer.
