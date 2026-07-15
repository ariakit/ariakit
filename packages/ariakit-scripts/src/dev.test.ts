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
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { shouldIgnorePackageWatchPath, watchPackageChanges } from "./dev.ts";
import { getCommandOutput } from "./utils.ts";

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

/**
 * Waits until a test process has written the expected signal sequence.
 */
async function waitForFileContents(filename: string, expected: string) {
  const timeout = Date.now() + 5000;
  while (Date.now() < timeout) {
    try {
      if ((await readFile(filename, "utf8")) === expected) return;
    } catch {
      // The signal log may not exist yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for ${expected.trim()} in ${filename}`);
}

/**
 * Waits until a test process has spawned a direct child.
 */
async function waitForChildProcess(pid: number) {
  const timeout = Date.now() + 5000;
  while (Date.now() < timeout) {
    try {
      const output = getCommandOutput(
        "pgrep",
        ["-P", String(pid)],
        process.cwd(),
      );
      const childPid = Number(output.split("\n")[0]);
      if (Number.isInteger(childPid)) return childPid;
    } catch {
      // The child may not have started yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for a child of process ${pid}`);
}

function killProcessGroup(pid: number, signal: NodeJS.Signals) {
  try {
    process.kill(-pid, signal);
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

/**
 * Force-kills a running test child and waits for its process resources to be
 * released.
 */
async function forceKillAndWait(child: ChildProcess, kill: () => void) {
  if (child.exitCode != null) return;
  if (child.signalCode != null) return;

  const exitPromise = once(child, "exit", {
    signal: AbortSignal.timeout(2000),
  });
  kill();
  await exitPromise;
}

/**
 * Waits until an isolated test process group has fully exited.
 */
async function waitForProcessGroupExit(pid: number) {
  const timeout = Date.now() + 2000;
  while (Date.now() < timeout) {
    try {
      process.kill(-pid, 0);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      if (!("code" in error)) {
        throw error;
      }
      if (error.code === "ESRCH") return;
      // Every process in this test group runs as the current user. EPERM means
      // the original group exited and its id is no longer ours to inspect.
      if (error.code === "EPERM") return;
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for process group ${pid}`);
}

/**
 * Waits until an isolated test coordinator has stopped for job control.
 */
async function waitForProcessStopped(pid: number) {
  const timeout = Date.now() + 2000;
  while (Date.now() < timeout) {
    try {
      const status = getCommandOutput(
        "ps",
        ["-o", "stat=", "-p", String(pid)],
        process.cwd(),
      );
      if (status.startsWith("T")) return;
    } catch {
      // The coordinator may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for process ${pid} to stop`);
}

class FakePackageWatcher {
  private listeners = new Map<string, ((filename: string) => void)[]>();

  closed = false;

  async close() {
    this.closed = true;
  }

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

test.skipIf(process.platform === "win32").each([
  {
    expectedExit: [0, null] as const,
    resumeBeforeShutdown: true,
    shutdownSignal: "SIGINT" as const,
  },
  {
    expectedExit: [131, null] as const,
    resumeBeforeShutdown: true,
    shutdownSignal: "SIGQUIT" as const,
  },
  {
    expectedExit: [null, "SIGKILL"] as const,
    resumeBeforeShutdown: false,
    shutdownSignal: "SIGKILL" as const,
  },
])(
  "handles $shutdownSignal without leaving dev processes",
  async ({ expectedExit, resumeBeforeShutdown, shutdownSignal }) => {
    const rootPath = await mkdtemp(join(tmpdir(), "ariakit-dev-command-"));
    const appSignalsPath = join(rootPath, "app-signals.txt");
    const argsPath = join(rootPath, "args.json");
    const commandScriptPath = join(rootPath, "command");
    const concPath = join(rootPath, "conc");
    const concPidPath = join(rootPath, "conc-pid.txt");
    const concSignalsPath = join(rootPath, "conc-signals.txt");
    const nextjsSignalsPath = join(rootPath, "nextjs-signals.txt");
    const scriptPath = join(
      process.cwd(),
      "packages/ariakit-scripts/src/index.ts",
    );
    const stoppedPath = join(rootPath, "stopped");
    const supervisorPidPath = join(rootPath, "supervisor-pid.txt");
    const supervisorPreloadPath = join(rootPath, "supervisor-preload.cjs");
    const searchPath = [rootPath, process.env.PATH]
      .filter(Boolean)
      .join(delimiter);
    const signalPaths = [concSignalsPath, appSignalsPath, nextjsSignalsPath];

    await writeFile(
      supervisorPreloadPath,
      `const { writeFileSync } = require("node:fs");
if (process.argv[1]?.endsWith("command-supervisor.ts")) {
  writeFileSync(process.env.SUPERVISOR_PID_PATH, String(process.pid));
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
}
`,
    );

    await writeFile(
      commandScriptPath,
      `#!/usr/bin/env node
const { appendFileSync } = require("node:fs");
const signalsPath = process.argv[2];
const recordSignal = (signal) => {
  appendFileSync(signalsPath, signal + "\\n");
};
const stop = (signal) => {
  recordSignal(signal);
  setTimeout(() => process.exit(0), 100);
};
process.on("SIGCONT", recordSignal);
process.on("SIGINT", stop);
process.on("SIGQUIT", stop);
process.on("SIGTERM", stop);
if (process.send) {
  process.send("ready");
}
setInterval(() => {}, 1000);
`,
    );
    await chmod(commandScriptPath, 0o755);

    await writeFile(
      concPath,
      `#!/usr/bin/env node
const { spawn } = require("node:child_process");
const { appendFileSync, writeFileSync } = require("node:fs");
writeFileSync(process.env.CONC_PID_PATH, String(process.pid));
const children = [
  process.env.APP_SIGNALS_PATH,
  process.env.NEXTJS_SIGNALS_PATH,
].map((signalsPath) =>
  spawn(process.env.COMMAND_SCRIPT_PATH, [signalsPath], {
    stdio: ["ignore", "ignore", "ignore", "ipc"],
  }),
);
let readyChildren = 0;
for (const child of children) {
  child.once("message", () => {
    readyChildren += 1;
    if (readyChildren !== children.length) return;
    writeFileSync(process.env.ARGS_PATH, JSON.stringify({
      args: process.argv.slice(2),
      astroDevBackground: process.env.ASTRO_DEV_BACKGROUND,
    }));
  });
}
let stopping = false;
const recordSignal = (signal) => {
  appendFileSync(process.env.CONC_SIGNALS_PATH, signal + "\\n");
};
const stop = (signal) => {
  recordSignal(signal);
  for (const child of children) {
    child.kill(signal);
  }
  if (stopping) return;
  stopping = true;
  Promise.all(
    children.map((child) => new Promise((resolve) => child.once("exit", resolve))),
  ).then(() => {
    writeFileSync(process.env.STOPPED_PATH, "");
    process.exit(0);
  });
};
process.on("SIGCONT", recordSignal);
process.on("SIGINT", stop);
process.on("SIGQUIT", (signal) => {
  recordSignal(signal);
  Promise.all(
    children.map((child) => new Promise((resolve) => child.once("exit", resolve))),
  ).then(() => process.exit(131));
});
process.on("SIGTERM", stop);
setInterval(() => {}, 1000);
`,
    );
    await chmod(concPath, 0o755);

    let concPid: number | undefined;
    const child = spawn(process.execPath, [scriptPath, "dev", "--no-clean"], {
      detached: true,
      env: {
        ...process.env,
        APP_SIGNALS_PATH: appSignalsPath,
        ARGS_PATH: argsPath,
        COMMAND_SCRIPT_PATH: commandScriptPath,
        CONC_PID_PATH: concPidPath,
        CONC_SIGNALS_PATH: concSignalsPath,
        NEXTJS_SIGNALS_PATH: nextjsSignalsPath,
        NODE_OPTIONS: [
          process.env.NODE_OPTIONS,
          `--require=${supervisorPreloadPath}`,
        ]
          .filter(Boolean)
          .join(" "),
        PATH: searchPath,
        STOPPED_PATH: stoppedPath,
        SUPERVISOR_PID_PATH: supervisorPidPath,
      },
      stdio: "ignore",
    });
    const pid = child.pid;
    if (!pid) {
      throw new Error("Failed to start the dev command");
    }

    try {
      if (resumeBeforeShutdown) {
        await waitForFile(supervisorPidPath);
        const supervisorPid = Number(await readFile(supervisorPidPath, "utf8"));
        killProcessGroup(pid, "SIGTSTP");
        concPid = await waitForChildProcess(supervisorPid);
        await waitForProcessStopped(concPid);
        killProcessGroup(pid, "SIGCONT");
      } else {
        await waitForFile(concPidPath);
        concPid = Number(await readFile(concPidPath, "utf8"));
      }

      await waitForFile(argsPath);
      await expect(readFile(concPidPath, "utf8")).resolves.toBe(
        String(concPid),
      );
      const result: unknown = JSON.parse(await readFile(argsPath, "utf8"));
      expect(result).toEqual({
        args: [
          "-r",
          expect.stringMatching(/^pnpm -F app run dev --port \d+$/),
          expect.stringMatching(/^pnpm -F nextjs run dev --port \d+$/),
        ],
        astroDevBackground: "0",
      });

      if (resumeBeforeShutdown) {
        await Promise.all(
          signalPaths.map((filename) => writeFile(filename, "")),
        );
        killProcessGroup(pid, "SIGTSTP");
        await waitForProcessStopped(concPid);
        killProcessGroup(pid, "SIGCONT");
        await Promise.all(
          signalPaths.map((filename) =>
            waitForFileContents(filename, "SIGCONT\n"),
          ),
        );
      } else {
        killProcessGroup(pid, "SIGTSTP");
        await waitForProcessStopped(concPid);
      }

      const exitPromise = once(child, "exit", {
        signal: AbortSignal.timeout(2000),
      });
      killProcessGroup(pid, shutdownSignal);
      const [exitCode, signal] = await exitPromise;
      expect([exitCode, signal]).toEqual(expectedExit);
      await waitForProcessGroupExit(concPid);
      concPid = undefined;
      if (shutdownSignal === "SIGINT") {
        await expect(
          access(stoppedPath),
          `dev exited with ${exitCode ?? signal} before cleanup finished`,
        ).resolves.toBeUndefined();
      }
      for (const filename of signalPaths) {
        const signals = await readFile(filename, "utf8");
        if (resumeBeforeShutdown) {
          expect(signals).toBe(`SIGCONT\n${shutdownSignal}\n`);
        } else {
          expect(signals.trim().split("\n").sort()).toEqual([
            "SIGCONT",
            "SIGTERM",
          ]);
        }
      }
    } finally {
      if (concPid) {
        killProcessGroup(concPid, "SIGKILL");
      }
      await forceKillAndWait(child, () => {
        killProcessGroup(pid, "SIGKILL");
      });
      await rm(rootPath, { recursive: true, force: true });
    }
  },
);

test("closes the package watcher when the dev command fails", async () => {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-dev-failure-"));
  const scriptPath = join(
    process.cwd(),
    "packages/ariakit-scripts/src/index.ts",
  );
  await mkdir(join(rootPath, "packages"));

  const child = spawn(process.execPath, [scriptPath, "dev"], {
    cwd: rootPath,
    env: {
      ...process.env,
      PATH: rootPath,
    },
    stdio: "ignore",
  });

  try {
    const [exitCode, signal] = await once(child, "exit", {
      signal: AbortSignal.timeout(2000),
    });
    expect([exitCode, signal]).toEqual([1, null]);
  } finally {
    await forceKillAndWait(child, () => child.kill("SIGKILL"));
    await rm(rootPath, { recursive: true, force: true });
  }
});

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

test("flushes pending package changes when the watcher closes", async () => {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-dev-close-"));
  let finishClean = () => {};
  const cleanFinished = new Promise<void>((resolve) => {
    finishClean = resolve;
  });
  let closePromise: Promise<void> | undefined;

  try {
    await mkdir(join(rootPath, "packages/foo/src"), { recursive: true });
    await writeFile(
      join(rootPath, "packages/foo/package.json"),
      `${JSON.stringify({ scripts: { clean: "ariakit clean" } }, null, 2)}\n`,
    );

    vi.useFakeTimers();
    vi.spyOn(process, "cwd").mockReturnValue(rootPath);

    const watcher = new FakePackageWatcher();
    const cleanPackages = vi.fn(() => cleanFinished);
    const handle = watchPackageChanges({
      cleanPackages,
      watch: () => watcher,
    });

    watcher.emit("change", "packages/foo/src/index.ts");
    let closed = false;
    closePromise = handle.close().then(() => {
      closed = true;
    });
    await vi.advanceTimersByTimeAsync(0);

    expect(watcher.closed).toBe(true);
    expect(cleanPackages).toHaveBeenCalledWith([
      {
        path: join(rootPath, "packages/foo"),
      },
    ]);
    expect(vi.getTimerCount()).toBe(0);
    expect(closed).toBe(false);

    finishClean();
    await closePromise;
    expect(closed).toBe(true);
  } finally {
    finishClean();
    await closePromise;
    await rm(rootPath, { recursive: true, force: true });
  }
});
