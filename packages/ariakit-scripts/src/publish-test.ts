import { chmodSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { publish } from "./publish.ts";

interface PublishFixture {
  binPath: string;
  rootPath: string;
}

const originalCwd = process.cwd();
const originalPath = process.env.PATH;

afterEach(() => {
  process.chdir(originalCwd);
  process.env.PATH = originalPath;
  process.exitCode = undefined;
  vi.restoreAllMocks();
});

async function createPublishFixture(): Promise<PublishFixture> {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-publish-"));
  const binPath = join(rootPath, "bin");
  mkdirSync(binPath);

  await writeFile(
    join(binPath, "pnpm"),
    `#!/bin/sh
printf '%s\\n' "$@" > pnpm-args.txt
cat > pnpm-publish-summary.json <<'JSON'
{"publishedPackages":[{"name":"@ariakit/a","version":"1.0.0"},{"name":"@ariakit/b","version":"2.0.0"}]}
JSON
`,
  );

  await writeFile(
    join(binPath, "git"),
    `#!/bin/sh
if [ "$1" = "rev-parse" ]; then
  exit 1
fi
if [ "$1" = "tag" ]; then
  printf '%s\\n' "$2" >> git-tags.txt
fi
`,
  );

  chmodSync(join(binPath, "pnpm"), 0o755);
  chmodSync(join(binPath, "git"), 0o755);

  process.chdir(rootPath);
  process.env.PATH = `${binPath}:${originalPath ?? ""}`;

  return { binPath, rootPath };
}

test("publishes packages through pnpm and prints changesets tag output", async () => {
  const { rootPath } = await createPublishFixture();
  const logs: unknown[][] = [];
  vi.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args);
  });

  publish();

  const tags = readFileSync(join(rootPath, "git-tags.txt"), "utf-8")
    .trim()
    .split("\n");

  expect(tags).toEqual(["@ariakit/a@1.0.0", "@ariakit/b@2.0.0"]);
  expect(logs).toContainEqual(["New tag: ", "@ariakit/a@1.0.0"]);
  expect(logs).toContainEqual(["New tag: ", "@ariakit/b@2.0.0"]);
  expect(existsSync(join(rootPath, "pnpm-publish-summary.json"))).toBe(false);

  await rm(rootPath, { recursive: true, force: true });
});

test("passes dry-run to pnpm without creating tags", async () => {
  const { rootPath } = await createPublishFixture();

  publish({ dryRun: true });

  const args = readFileSync(join(rootPath, "pnpm-args.txt"), "utf-8")
    .trim()
    .split("\n");

  expect(args).toContain("--dry-run");
  expect(existsSync(join(rootPath, "git-tags.txt"))).toBe(false);
  expect(existsSync(join(rootPath, "pnpm-publish-summary.json"))).toBe(false);

  await rm(rootPath, { recursive: true, force: true });
});

test("fails before publishing in changesets pre mode", async () => {
  const { rootPath } = await createPublishFixture();
  const errors: unknown[][] = [];
  mkdirSync(join(rootPath, ".changeset"));
  await writeFile(
    join(rootPath, ".changeset/pre.json"),
    JSON.stringify({ mode: "pre", tag: "next" }),
  );
  vi.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args);
  });

  publish();

  expect(process.exitCode).toBe(1);
  expect(errors).toContainEqual([
    "ariakit publish does not support Changesets pre mode yet.",
  ]);
  expect(existsSync(join(rootPath, "pnpm-args.txt"))).toBe(false);

  await rm(rootPath, { recursive: true, force: true });
});
