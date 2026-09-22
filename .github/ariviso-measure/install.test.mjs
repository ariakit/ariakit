import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  mkdtempDisposable,
  readFile,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { sha256 } from "../ariviso/identity.mjs";

test("the installer loads a checksum-pinned package without registry metadata", async () => {
  await using directory = await mkdtempDisposable(
    path.join(os.tmpdir(), "ariviso-measure-install-"),
  );
  const executor = path.join(directory.path, "ariviso");
  const measurement = path.join(directory.path, "ariviso-measure");
  const fixture = path.join(directory.path, "fixture/package");
  await mkdir(executor);
  await mkdir(measurement);
  await mkdir(fixture, { recursive: true });
  await cp(
    new URL("install.mjs", import.meta.url),
    path.join(measurement, "install.mjs"),
  );
  await cp(
    new URL("../ariviso/identity.mjs", import.meta.url),
    path.join(executor, "identity.mjs"),
  );
  await writeFile(
    path.join(executor, "package.json"),
    JSON.stringify({
      private: true,
      dependencies: { "@playwright/test": "1.63.0", pngjs: "7.0.0" },
    }),
  );
  await writeFile(
    path.join(fixture, "package.json"),
    JSON.stringify({
      name: "@ariviso/playwright",
      version: "0.1.0",
      type: "module",
      exports: "./index.js",
      peerDependencies: { "@playwright/test": "1.63.0" },
    }),
  );
  await writeFile(
    path.join(fixture, "index.js"),
    'export function visual() { return "fixture"; }',
  );
  const archive = path.join(directory.path, "adapter.tgz");
  const packed = spawnSync(
    "tar",
    ["-czf", archive, "-C", path.dirname(fixture), "package"],
    { encoding: "utf8" },
  );
  assert.equal(packed.status, 0, packed.stderr);
  const settings = path.join(executor, "settings.json");
  await writeFile(
    settings,
    JSON.stringify({
      packages: { playwright: { sha256: sha256(await readFile(archive)) } },
    }),
  );
  const preload = path.join(directory.path, "fetch.mjs");
  await writeFile(
    preload,
    'import { readFile } from "node:fs/promises";\n' +
      "globalThis.fetch = async () => new Response(await readFile(process.env.FIXTURE_ARCHIVE));\n",
  );
  const run = () =>
    spawnSync(
      process.execPath,
      ["--import", preload, path.join(measurement, "install.mjs")],
      {
        cwd: directory.path,
        encoding: "utf8",
        timeout: 30_000,
        env: {
          ...process.env,
          ARIVISO_PLAYWRIGHT_TARBALL_URL: "https://fixture.invalid/adapter.tgz",
          FIXTURE_ARCHIVE: archive,
          npm_config_cache: path.join(directory.path, "empty-cache"),
          npm_config_registry: "https://fixture.invalid",
        },
      },
    );
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  const module = await import(
    pathToFileURL(
      path.join(executor, "node_modules/@ariviso/playwright/index.js"),
    ).href
  );
  assert.equal(module.visual(), "fixture");
  await assert.rejects(access(path.join(directory.path, "empty-cache")));

  await writeFile(
    settings,
    JSON.stringify({ packages: { playwright: { sha256: "0".repeat(64) } } }),
  );
  const mismatch = run();
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /does not match the existing checksum/);
});
