import { resolve } from "node:path";
import type { TestInfo } from "@playwright/test";
import { getVisualSnapshotArg, withVisualSnapshotInfo } from "./visual.ts";

test("getVisualSnapshotArg points to the shared visual snapshot directory", () => {
  const snapshotDir = resolve(
    import.meta.dirname,
    "../examples/disclosure/test-browser.ts-snapshots",
  );
  const snapshotArg = getVisualSnapshotArg(snapshotDir, "example.png");
  expect(resolve(snapshotDir, snapshotArg)).toBe(
    resolve(import.meta.dirname, "../tests/visual/example.png"),
  );
});

test("withVisualSnapshotInfo restores snapshot settings after success", async () => {
  const testInfo = {
    snapshotDir: "/tmp/original-snapshot-dir",
    snapshotSuffix: "-project",
  } satisfies Pick<TestInfo, "snapshotDir" | "snapshotSuffix">;

  let snapshotDirDuringCallback = "";
  let snapshotSuffixDuringCallback = "";

  await withVisualSnapshotInfo(testInfo, async () => {
    snapshotDirDuringCallback = testInfo.snapshotDir;
    snapshotSuffixDuringCallback = testInfo.snapshotSuffix;
  });

  expect(snapshotDirDuringCallback).toBe(
    resolve(import.meta.dirname, "../tests/visual"),
  );
  expect(snapshotSuffixDuringCallback).toBe("");
  expect(testInfo.snapshotDir).toBe("/tmp/original-snapshot-dir");
  expect(testInfo.snapshotSuffix).toBe("-project");
});

test("withVisualSnapshotInfo restores snapshot settings after failure", async () => {
  const error = new Error("snapshot failed");
  const testInfo = {
    snapshotDir: "/tmp/original-snapshot-dir",
    snapshotSuffix: "-project",
  } satisfies Pick<TestInfo, "snapshotDir" | "snapshotSuffix">;

  await expect(
    withVisualSnapshotInfo(testInfo, async () => {
      throw error;
    }),
  ).rejects.toThrow(error);

  expect(testInfo.snapshotDir).toBe("/tmp/original-snapshot-dir");
  expect(testInfo.snapshotSuffix).toBe("-project");
});
