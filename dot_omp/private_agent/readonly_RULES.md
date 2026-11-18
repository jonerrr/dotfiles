# GitHub Access Policy

- Treat GitHub as read-only by default.
- The built-in GitHub tool and GitHub CLI (`gh`) may be used to read repositories, pull requests, issues, commits, workflows, and CI results.
- Never use these tools to create, modify, delete, merge, close, comment on, or otherwise mutate GitHub resources.
- Never push commits or tags to remote repositories.
- Local Git operations, including creating commits, branches, and inspecting diffs, are allowed.
- If a task requires modifying a remote GitHub resource, explain the required operation and ask me to perform it manually. Do not execute the operation yourself.
- Do not work around these restrictions using alternative tools, APIs, or commands.

# Sandbox Environment

- You are running inside a `mise` filesystem sandbox (`allow_read` / `allow_write`).
- If a tool or command fails with a permission error (`Permission denied`, `EACCES`, `EPERM`) when accessing a path outside the allowed directories, notify the user with the exact path and whether read or write access was needed so they can add it to the sandbox allowlist and relaunch.
- Do not attempt to bypass or work around sandbox restrictions.
