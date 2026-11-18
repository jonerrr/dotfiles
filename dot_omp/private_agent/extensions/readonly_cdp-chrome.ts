import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";
import { lookup } from "@oh-my-pi/pi-coding-agent/config/registry";

const DEFAULT_CDP_URL = "http://127.0.0.1:9222";
const STARTUP_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 150;

let inFlightStart: Promise<void> | null = null;

function getSetting<T>(pi: ExtensionAPI, id: string, fallback: T): T {
  try {
    const def = lookup(id);
    if (def) {
      const val = def.get(pi.pi.settings);
      if (val !== undefined && val !== null) return val as T;
    }
  } catch {
    // Fall back to default if registry lookup is unavailable
  }
  return fallback;
}

function getCdpUrl(pi: ExtensionAPI): string {
  const raw = getSetting<string>(pi, "browser.cdpUrl", DEFAULT_CDP_URL);
  return raw.replace(/\/+$/, "");
}

function resolveChromeBinary(): string | null {
  const miseDataDir =
    process.env.MISE_DATA_DIR ||
    path.join(os.homedir(), ".local", "share", "mise");
  const miseChrome = path.join(
    miseDataDir,
    "installs",
    "http-chrome",
    "latest",
    "chrome",
  );
  if (fs.existsSync(miseChrome)) return miseChrome;

  const shimChrome = path.join(miseDataDir, "shims", "chrome");
  if (fs.existsSync(shimChrome)) return shimChrome;

  return null;
}

async function isCdpReachable(cdpUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${cdpUrl}/json/version`, {
      signal: AbortSignal.timeout(1000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function parsePort(cdpUrl: string): string {
  try {
    const url = new URL(cdpUrl);
    if (url.port) return url.port;
    return url.protocol === "https:" ? "443" : "80";
  } catch {
    return "9222";
  }
}

async function startChrome(
  pi: ExtensionAPI,
  cdpUrl: string,
  ctx?: ExtensionContext,
): Promise<void> {
  if (await isCdpReachable(cdpUrl)) return;

  const chromeBin = resolveChromeBinary();
  if (!chromeBin) {
    throw new Error("Could not find mise-installed Chrome");
  }

  const port = parsePort(cdpUrl);
  const userDataDir = path.join(os.homedir(), ".local", "share", "dev-chrome");
  const hasDisplay = Boolean(
    process.env.DISPLAY || process.env.WAYLAND_DISPLAY,
  );
  const headless =
    !hasDisplay || getSetting<boolean>(pi, "browser.headless", true);
  const args = [
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${port}`,
    "--no-first-run",
    "--no-default-browser-check",
  ];
  if (headless) {
    args.push("--headless=new");
  }
  args.push("about:blank");

  pi.logger.info("Starting mise Chrome for CDP", {
    chromeBin,
    cdpUrl,
    headless,
  });

  let exitedEarly: string | null = null;
  const child = spawn(chromeBin, args, {
    detached: true,
    stdio: "ignore",
  });
  child.on("error", (err) => {
    exitedEarly = err.message;
  });
  child.on("exit", (code, signal) => {
    exitedEarly = `exited with code=${code ?? "null"} signal=${signal ?? "null"}`;
  });
  child.unref();

  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (exitedEarly) {
      throw new Error(`Chrome failed to start (${exitedEarly})`);
    }
    if (await isCdpReachable(cdpUrl)) {
      if (ctx?.hasUI) {
        ctx.ui.notify(`Started Chrome CDP on ${cdpUrl}`, "info");
      }
      return;
    }
    await Bun.sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for Chrome CDP at ${cdpUrl}`);
}

async function ensureChrome(
  pi: ExtensionAPI,
  ctx?: ExtensionContext,
): Promise<void> {
  const cdpUrl = getCdpUrl(pi);
  if (await isCdpReachable(cdpUrl)) return;

  if (!inFlightStart) {
    inFlightStart = startChrome(pi, cdpUrl, ctx).finally(() => {
      inFlightStart = null;
    });
  }
  await inFlightStart;
}

function toolUsesBrowser(
  toolName: string,
  input: Record<string, unknown>,
): boolean {
  if (toolName === "eval") {
    const code = typeof input.code === "string" ? input.code : "";
    return /\bbrowser\b/.test(code);
  }
  return toolName.includes("chrome-devtools");
}

export default function cdpChromeExtension(pi: ExtensionAPI) {
  pi.setLabel("Mise Chrome CDP");

  pi.on("tool_call", async (event, ctx) => {
    if (!toolUsesBrowser(event.toolName, event.input)) return;

    try {
      await ensureChrome(pi, ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      pi.logger.warn("Failed to ensure Chrome CDP", { error: message });
      return {
        block: true,
        reason: `Chrome CDP startup failed: ${message}`,
      };
    }
  });

  pi.registerCommand("chrome", {
    description: "Check or start mise Chrome with CDP",
    handler: async (args, ctx) => {
      const cdpUrl = getCdpUrl(pi);
      const sub = args.trim().toLowerCase();
      if (sub === "status") {
        const up = await isCdpReachable(cdpUrl);
        ctx.ui.notify(
          `Chrome CDP (${cdpUrl}): ${up ? "running" : "stopped"}`,
          up ? "info" : "warning",
        );
        return;
      }
      try {
        await ensureChrome(pi, ctx);
        ctx.ui.notify(`Chrome CDP ready at ${cdpUrl}`, "info");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        ctx.ui.notify(`Chrome CDP failed: ${message}`, "error");
      }
    },
  });
}
