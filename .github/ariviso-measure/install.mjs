import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256 } from "../ariviso/identity.mjs";

const executor = path.resolve(import.meta.dirname, "../ariviso");
const settings = JSON.parse(
  await readFile(path.join(executor, "settings.json"), "utf8"),
);
const url = new URL(process.env.ARIVISO_PLAYWRIGHT_TARBALL_URL);
if (url.protocol !== "https:") {
  throw new Error("The adapter requires HTTPS");
}
const response = await fetch(url, {
  redirect: "error",
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok || !response.body) {
  throw new Error("The adapter download failed");
}
const chunks = [];
let size = 0;
for await (const chunk of response.body) {
  size += chunk.byteLength;
  if (size > 10 * 1024 * 1024) {
    throw new Error("The adapter exceeds the download limit");
  }
  chunks.push(chunk);
}
const bytes = Buffer.concat(chunks);
if (sha256(bytes) !== settings.packages.playwright.sha256) {
  throw new Error("The adapter does not match the existing checksum");
}
await mkdir(path.join(executor, "packages"), { recursive: true });
const archive = path.join(executor, "packages/playwright.tgz");
await writeFile(archive, bytes);
const destination = path.join(executor, "node_modules/@ariviso/playwright");
await mkdir(destination, { recursive: true });
// The checksum identifies the reviewed package; npm ci already installed its
// exact Playwright and PNG dependencies from the executor lockfile.
const result = spawnSync(
  "tar",
  ["-xzf", archive, "-C", destination, "--strip-components=1"],
  { cwd: executor, stdio: "inherit" },
);
if (result.error || result.status !== 0) {
  throw new Error("The pinned adapter installation failed");
}
