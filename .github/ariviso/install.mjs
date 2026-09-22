import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { sha256 } from "./identity.mjs";

const settings = JSON.parse(
  await readFile(new URL("settings.json", import.meta.url), "utf8"),
);
const directory = path.resolve(import.meta.dirname, "../.ariviso-packages");
await mkdir(directory, { recursive: true });
const archives = [];
const packageUrlKeys = {
  playwright: "ARIVISO_PLAYWRIGHT_TARBALL_URL",
  cli: "ARIVISO_CLI_TARBALL_URL",
};
for (const [name, variable] of Object.entries(packageUrlKeys)) {
  const artifact = settings.packages[name];
  if (!artifact || !/^[a-f0-9]{64}$/.test(artifact.sha256)) {
    throw new Error(`Pin the ${name} package SHA-256 before capture`);
  }
  const packageUrl = process.env[variable];
  if (!packageUrl) {
    throw new Error(`Set the ${variable} repository secret before capture`);
  }
  const url = new URL(packageUrl);
  if (url.protocol !== "https:") {
    throw new Error("Package artifacts require HTTPS");
  }
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok || !response.body) {
    throw new Error(`Package artifact failed: ${response.status}`);
  }
  const chunks = [];
  let byteLength = 0;
  for await (const chunk of response.body) {
    byteLength += chunk.byteLength;
    if (byteLength > 10 * 1024 * 1024) {
      throw new Error(`The ${name} package exceeds the download limit`);
    }
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks, byteLength);
  if (sha256(bytes) !== artifact.sha256) {
    throw new Error(`The ${name} package does not match its pinned bytes`);
  }
  const archive = path.join(directory, `${name}.tgz`);
  await writeFile(archive, bytes);
  archives.push(archive);
}
// Install only into the independent executor root. Its existing lockfile pins
// all transitive dependencies, and neither manifest is changed by this step.
const result = spawnSync(
  "npm",
  [
    "install",
    "--offline",
    "--no-save",
    "--package-lock=false",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--workspaces=false",
    ...archives,
  ],
  {
    cwd: import.meta.dirname,
    stdio: "inherit",
  },
);
if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(`Pinned package install failed: ${result.status}`);
}
