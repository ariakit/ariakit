import { spawn } from "node:child_process";
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

class FakePackageWatcher {
  private listeners = new Map<string, ((filename: string) => void)[]>();

  async close() {}

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

test.skipIf(process.platform === "win32")(
  "keeps Astro attached until the dev command exits",
  async () => {
    const rootPath = await mkdtemp(join(tmpdir(), "ariakit-dev-command-"));
    const argsPath = join(rootPath, "args.json");
    const stoppedPath = join(rootPath, "stopped");
    const concPath = join(rootPath, "conc");
    const scriptPath = join(
      process.cwd(),
      "packages/ariakit-scripts/src/index.ts",
    );
    const commandPath = [rootPath, process.env.PATH]
      .filter(Boolean)
      .join(delimiter);

    await writeFile(
      concPath,
      `#!/usr/bin/env node
const { writeFileSync } = require("node:fs");
setTimeout(() => {
  writeFileSync(process.env.ARGS_PATH, JSON.stringify({
    args: process.argv.slice(2),
    astroDevBackground: process.env.ASTRO_DEV_BACKGROUND,
  }));
}, 50);
let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  setTimeout(() => {
    writeFileSync(process.env.STOPPED_PATH, "");
    process.exit(0);
  }, 100);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1000);
`,
    );
    await chmod(concPath, 0o755);

    const child = spawn(process.execPath, [scriptPath, "dev", "--no-clean"], {
      detached: true,
      env: {
        ...process.env,
        ARGS_PATH: argsPath,
        PATH: commandPath,
        STOPPED_PATH: stoppedPath,
      },
      stdio: "ignore",
    });
    const exitPromise = once(child, "exit");
    const pid = child.pid;
    if (!pid) {
      throw new Error("Failed to start the dev command");
    }

    try {
      await waitForFile(argsPath);
      const result: unknown = JSON.parse(await readFile(argsPath, "utf8"));
      expect(result).toEqual({
        args: [
          "-r",
          expect.stringMatching(/^pnpm -F app run dev --port \d+$/),
          expect.stringMatching(/^pnpm -F nextjs run dev --port \d+$/),
        ],
        astroDevBackground: "0",
      });

      killProcessGroup(pid, "SIGINT");
      const [exitCode, signal] = await exitPromise;
      expect([exitCode, signal]).toEqual([0, null]);
      await expect(
        access(stoppedPath),
        `dev exited with ${exitCode ?? signal} before cleanup finished`,
      ).resolves.toBeUndefined();
    } finally {
      killProcessGroup(pid, "SIGKILL");
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
    child.kill("SIGKILL");
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
