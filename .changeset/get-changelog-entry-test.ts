import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { expect, test } from "vitest";

test("changesets getChangelogEntry hook", async () => {
  // Create a temporary package to avoid touching real repo packages
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "changesets-test-"));
  const pkgDir = path.join(tempDir, "pkg-a");
  await fs.ensureDir(pkgDir);
  await fs.writeJson(
    path.join(pkgDir, "package.json"),
    { name: "pkg-a", version: "1.0.0" },
    { spaces: 2 },
  );

  const releasePlan = {
    changesets: [
      {
        id: "fake-id-1",
        summary: "Overview\n\nAdd awesome feature",
        releases: [{ name: "pkg-a", type: "minor" }],
      },
      {
        id: "fake-id-2",
        summary: "Testing title\n\nAdd awesome feature\n\n2",
        releases: [{ name: "pkg-a", type: "minor" }],
      },
      {
        id: "fake-id-3",
        summary: "Chore: update docs",
        releases: [{ name: "pkg-a", type: "patch" }],
      },
    ],
    releases: [
      {
        name: "pkg-a",
        type: "minor",
        newVersion: "1.1.0",
        changesets: ["fake-id-1", "fake-id-2", "fake-id-3"],
      },
    ],
    preState: undefined,
  } as const;

  const packages = {
    root: { dir: process.cwd() },
    packages: [
      {
        dir: pkgDir,
        packageJson: { name: "pkg-a", version: "1.0.0" },
      },
    ],
  } as const;

  const applyReleasePlan = (await import("@changesets/apply-release-plan"))
    .default as unknown as (...args: any[]) => Promise<string[]>;

  // Minimal config that points to our repo's .changeset/changelog.cjs
  const config = {
    changelog: ["./changelog.cjs", {}],
    updateInternalDependencies: "patch",
    ___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH: {
      onlyUpdatePeerDependentsWhenOutOfRange: true,
    },
    bumpVersionsWithWorkspaceProtocolOnly: false,
    prettier: false,
    ignore: [],
    privatePackages: { version: false, tag: false },
  } as const;

  const touched = await applyReleasePlan(releasePlan, packages, config);
  expect(Array.isArray(touched)).toBe(true);

  const changelogPath = path.join(pkgDir, "CHANGELOG.md");
  const changelog = await fs.readFile(changelogPath, "utf8");

  expect(changelog).toMatchInlineSnapshot(`
    "# pkg-a

    ## 1.1.0

    Add awesome feature

    ### Testing title

    Add awesome feature

    2

    ### Other updates

    - Chore: update docs
    "
  `);
});
