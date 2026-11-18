# env.nu
#
# Installed by:
# version = "0.103.0"
#
# Previously, environment variables were typically configured in `env.nu`.
# In general, most configuration can and should be performed in `config.nu`
# or one of the autoload directories.
#
# This file is generated for backwards compatibility for now.
# It is loaded before config.nu and login.nu
#
# See https://www.nushell.sh/book/configuration.html
#
# Also see `help config env` for more options.
#
# You can remove these comments if you want or leave
# them for future reference.

let mise_path = $nu.default-config-dir | path join mise.nu
^mise activate nu | save $mise_path --force

let runtime_dir = $"/run/user/(id -u | str trim)"
let socket_dir = $"($runtime_dir)/zellij"

if ($runtime_dir | path exists) {
    $env.ZELLIJ_SOCKET_DIR = $socket_dir
}

# pnpm
# $env.PNPM_HOME = "/var/home/jonah/.local/share/pnpm"
# $env.PATH = ($env.PATH | split row (char esep) | prepend ($env.PNPM_HOME | path join "bin") )
# pnpm end
