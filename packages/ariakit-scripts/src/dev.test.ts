import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { once } from "node:events";
import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { shouldIgnorePackageWatchPath, watchPackageChanges } from "./dev.ts";

async function waitForFile(filename: string) {
  const timeout = Date.now() + 5000;
  while (Date.now() < timeout) {
    try {
      await access(filename);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
  throw new Error(`Timed out waiting for ${filename}`);
}

async function isPortAvailable(port: number) {
  return await new Promise<boolean>((resolve, reject) => {
    const server = createServer();
    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }
      reject(error);
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function waitForPortsAvailable(ports: number[]) {
  const timeout = Date.now() + 5000;
  while (Date.now() < timeout) {
    const available = await Promise.all(ports.map(isPortAvailable));
    if (available.every(Boolean)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for ports ${ports.join(", ")}`);
}

function killProcess(pid: number, signal: NodeJS.Signals) {
  try {
    process.kill(pid, signal);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    if (!("code" in error)) {
      throw error;
    }
    if (error.code !== "ESRCH") {
      throw error;
    }
  }
}

function killProcessGroup(pid: number, signal: NodeJS.Signals) {
  killProcess(-pid, signal);
}

async function forceKillAndWait(child: ChildProcess, pid: number) {
  if (child.exitCode != null) return;
  if (child.signalCode != null) return;

  const exitPromise = once(child, "exit", {
    signal: AbortSignal.timeout(5000),
  });
  killProcessGroup(pid, "SIGKILL");
  await exitPromise;
}

class FakePackageWatcher {
  private listeners = new Map<string, ((filename: string) => void)[]>();

  on(event: string, listener: (filename: string) => void) {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
    return this;
  }

  emit(event: string, filename: string) {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    for (const listener of listeners) {
      listener(filename);
    }
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("ignores package watch paths outside source and package json", () => {
  expect(shouldIgnorePackageWatchPath("packages/foo/node_modules/bar.ts")).toBe(
    true,
  );
  expect(shouldIgnorePackageWatchPath("packages/foo/dist/index.js")).toBe(true);
  expect(shouldIgnorePackageWatchPath("packages/foo/solid/index.js")).toBe(
    true,
  );
  expect(shouldIgnorePackageWatchPath("packages/foo/coverage/index.html")).toBe(
    true,
  );
  expect(shouldIgnorePackageWatchPath("packages/foo/benchmark/index.ts")).toBe(
    true,
  );
  expect(shouldIgnorePackageWatchPath("packages/foo/readme.md")).toBe(true);
  expect(shouldIgnorePackageWatchPath("packages/foo/package.json")).toBe(false);
  expect(
    shouldIgnorePackageWatchPath("packages/ariakit-solid/src/index.ts"),
  ).toBe(false);
  expect(
    shouldIgnorePackageWatchPath(
      join(process.cwd(), "packages/ariakit-solid/src/index.ts"),
    ),
  ).toBe(false);
  expect(shouldIgnorePackageWatchPath("packages/foo/src/solid/index.ts")).toBe(
    false,
  );
  expect(shouldIgnorePackageWatchPath("packages/foo/src/dist/index.ts")).toBe(
    false,
  );
  expect(
    shouldIgnorePackageWatchPath("packages/foo/src/benchmark/index.ts"),
  ).toBe(false);
});

test.skipIf(process.platform === "win32").each(["SIGINT", "SIGKILL"] as const)(
  "releases both dev ports after %s",
  async (signal) => {
    const rootPath = await mkdtemp(join(tmpdir(), "ariakit-dev-command-"));
    const appReadyPath = join(rootPath, "app-ready.txt");
    const concPath = join(rootPath, "conc");
    const nextjsReadyPath = join(rootPath, "nextjs-ready.txt");
    const readyPath = join(rootPath, "ready.txt");
    const serverPath = join(rootPath, "server.cjs");
    const scriptPath = join(
      process.cwd(),
      "packages/ariakit-scripts/src/index.ts",
    );
    const searchPath = [rootPath, process.env.PATH]
      .filter(Boolean)
      .join(delimiter);
    const portSeed = 30000 + (process.pid % 5000);

    await writeFile(
      serverPath,
      `const { createServer } = require("node:net");
const { existsSync, writeFileSync } = require("node:fs");
const port = Number(process.argv[2]);
const server = createServer();
const interval = setInterval(() => {
  if (existsSync(process.env.ROOT_PATH)) return;
  clearInterval(interval);
  server.close(() => process.exit(0));
}, 25);
server.listen(port, "127.0.0.1", () => {
  writeFileSync(process.argv[3], String(process.pid));
});
`,
    );
    await writeFile(
      concPath,
      `#!/usr/bin/env node
const { spawn } = require("node:child_process");
const { renameSync, writeFileSync } = require("node:fs");
// Model Astro 7 daemonizing unless background mode is explicitly disabled.
spawn(
  process.execPath,
  [process.env.SERVER_PATH, process.env.APP_PORT, process.env.APP_READY_PATH],
  {
    detached: process.env.ASTRO_DEV_BACKGROUND !== "0",
    stdio: "ignore",
  },
);
spawn(
  process.execPath,
  [
    process.env.SERVER_PATH,
    process.env.NEXTJS_PORT,
    process.env.NEXTJS_READY_PATH,
  ],
  { stdio: "ignore" },
);
const readyTempPath = process.env.READY_PATH + ".tmp";
writeFileSync(
  readyTempPath,
  [process.env.APP_PORT, process.env.NEXTJS_PORT].join("\\n"),
);
renameSync(readyTempPath, process.env.READY_PATH);
`,
    );
    await chmod(concPath, 0o755);

    // Isolate the test group so its signals never reach the Vitest process.
    const child = spawn(process.execPath, [scriptPath, "dev", "--no-clean"], {
      detached: true,
      env: {
        ...process.env,
        APP_PORT: String(portSeed),
        APP_READY_PATH: appReadyPath,
        ASTRO_DEV_BACKGROUND: "",
        NEXTJS_PORT: String(portSeed + 10000),
        NEXTJS_READY_PATH: nextjsReadyPath,
        PATH: searchPath,
        READY_PATH: readyPath,
        ROOT_PATH: rootPath,
        SERVER_PATH: serverPath,
      },
      stdio: "ignore",
    });
    const pid = child.pid;
    if (!pid) {
      throw new Error("Failed to start the dev command");
    }

    let ports: number[] = [];
    try {
      await waitForFile(readyPath);
      const [actualAppPort, actualNextjsPort] = (
        await readFile(readyPath, "utf8")
      ).split("\n");

      const actualPorts = [Number(actualAppPort), Number(actualNextjsPort)];
      if (!actualPorts.every(Number.isInteger)) {
        throw new Error(`Invalid dev ports: ${actualPorts.join(", ")}`);
      }
      ports = actualPorts;
      await Promise.all([
        waitForFile(appReadyPath),
        waitForFile(nextjsReadyPath),
      ]);

      const exitPromise = once(child, "exit", {
        signal: AbortSignal.timeout(5000),
      });
      killProcessGroup(pid, signal);
      await exitPromise;
      await waitForPortsAvailable(ports);
    } finally {
      await forceKillAndWait(child, pid);
      await rm(rootPath, { recursive: true, force: true });
      if (ports.length) {
        await waitForPortsAvailable(ports);
      }
    }
  },
);

test("watches packages and cleans changed package entries", async () => {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-dev-"));

  try {
    await mkdir(join(rootPath, "packages/foo/src"), { recursive: true });
    await mkdir(join(rootPath, "packages/bar/src"), { recursive: true });
    await writeFile(
      join(rootPath, "packages/foo/package.json"),
      `${JSON.stringify({ scripts: { clean: "ariakit clean" } }, null, 2)}\n`,
    );
    await writeFile(
      join(rootPath, "packages/bar/package.json"),
      `${JSON.stringify({ scripts: { clean: "custom clean" } }, null, 2)}\n`,
    );

    vi.useFakeTimers();
    vi.spyOn(process, "cwd").mockReturnValue(rootPath);

    const watcher = new FakePackageWatcher();
    const cleanPackages = vi.fn(async (_packages: unknown[]) => {});
    const watchPackages = vi.fn(() => watcher);

    watchPackageChanges({ cleanPackages, watch: watchPackages });

    expect(watchPackages).toHaveBeenCalledWith("packages", {
      ignoreInitial: true,
      ignored: shouldIgnorePackageWatchPath,
    });

    watcher.emit("change", "packages/foo/readme.md");
    await vi.advanceTimersByTimeAsync(100);

    expect(cleanPackages).not.toHaveBeenCalled();

    watcher.emit("add", "packages/foo/src/new-file.ts");
    watcher.emit("change", join(rootPath, "packages/foo/package.json"));
    await vi.advanceTimersByTimeAsync(100);

    const firstCall = cleanPackages.mock.calls[0];
    expect(firstCall?.[0]).toEqual([
      {
        path: join(rootPath, "packages/foo"),
      },
    ]);
    expect(cleanPackages).toHaveBeenCalledTimes(1);

    watcher.emit("change", "packages/bar/src/index.ts");
    await vi.advanceTimersByTimeAsync(100);

    const secondCall = cleanPackages.mock.calls[1];
    expect(secondCall?.[0]).toEqual([
      {
        path: join(rootPath, "packages/bar"),
      },
    ]);
    expect(cleanPackages).toHaveBeenCalledTimes(2);
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});
