# config.nu
#
# Installed by:
# version = "0.103.0"
#
# This file is used to override default Nushell settings, define
# (or import) custom commands, or run any other startup tasks.
# See https://www.nushell.sh/book/configuration.html
#
# This file is loaded after env.nu and before login.nu
#
# You can open this file in your default editor using:
# config nu
#
# See `help config nu` for more options
#
# You can remove these comments if you want or leave
# them for future reference.
$env.config.show_banner = false
$env.EDITOR = 'nvim'

# To add entries to PATH (on Windows you might use Path), you can use the following pattern:
# $env.PATH = ($env.PATH | split row (char esep) | prepend '/var/home/jonah/.cargo/bin/')
# $env.PATH = ($env.PATH | split row (char esep) | prepend '/var/home/jonah/.local/bin/')
# $env.PATH = ($env.PATH | split row (char esep) | prepend '/home/jonah/go/bin/')
# $env.PATH = ($env.PATH | split row (char esep) | prepend '~/.krew/bin')
# $env.PATH = ($env.PATH | split row (char esep) | prepend '/home/jonah/.local/share/pnpm')
# $env.PATH = ($env.PATH | split row (char esep) | prepend '/home/linuxbrew/.linuxbrew/bin')
# make vscode default to wayland
$env.ELECTRON_OZONE_PLATFORM_HINT = 'auto'

# bitwarden ssh agent
$env.SSH_AUTH_SOCK = $"($env.home)/.var/app/com.bitwarden.desktop/data/.bitwarden-ssh-agent.sock"

# temp fix for vulkan with gpu in distrobox, see https://github.com/89luca89/distrobox/issues/1687#issuecomment-2727166491
# still needed bc it only sets for bash
$env.VK_ICD_FILENAMES = '/run/host/usr/share/vulkan/icd.d/nvidia_icd.x86_64.json'

# if (($env | columns) | any {|col| $col == "PNPM_HOME"}) and (not ($env.PATH | split row ':' | any {|path| $path == $env.PNPM_HOME })) {
#     $env.PATH = ($env.PNPM_HOME + ":" + $env.PATH)
# }

# alias podman = distrobox-host-exec podman
alias pd = podman compose
alias csp = cargo sqlx prepare

alias fgk = flux get kustomizations --watch
alias fga = flux get all -A --status-selector ready=false
alias frc = flux reconcile kustomization cluster-apps --with-source

alias dht = distrobox-host-exec fish

use ($nu.default-config-dir | path join mise.nu)

def --wrapped omp [...args: string] {
  ^fnox -P omp exec --only KUBECONFIG -- mise run omp -- ...$args
}

def --wrapped kubectl [...args: string] {
  ^fnox exec --only KUBECONFIG -- kubectl ...$args
}

def --wrapped k9s [...args: string] {
  ^fnox exec --only KUBECONFIG -- k9s ...$args
}

def --wrapped flux [...args: string] {
  ^fnox exec --only KUBECONFIG -- flux ...$args
}

def --wrapped helm [...args: string] {
  ^fnox exec --only KUBECONFIG -- helm ...$args
}
