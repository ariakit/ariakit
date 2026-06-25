import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { shouldIgnorePackageWatchPath, watchPackageChanges } from "./dev.ts";

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

test("watches packages and cleans changed package entries", async () => {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-dev-"));

  try {
    await mkdir(join(rootPath, "packages/foo/src"), { recursive: true });
    await writeFile(
      join(rootPath, "packages/foo/package.json"),
      `${JSON.stringify({ scripts: { clean: "ariakit clean" } }, null, 2)}\n`,
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
        type: "ariakit",
      },
    ]);
    expect(cleanPackages).toHaveBeenCalledTimes(1);
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});
