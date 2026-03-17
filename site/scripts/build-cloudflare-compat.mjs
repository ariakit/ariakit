import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";

const distDir = new URL("../dist/", import.meta.url);
const clientDir = new URL("../dist/client/", import.meta.url);
const legacyWorkerDir = new URL("../dist/_worker.js/", import.meta.url);

if (!existsSync(clientDir)) {
  process.exit(0);
}

// Temporary compatibility layer for the default-branch preview workflow,
// which still deploys the app artifact using the pre-Astro-6 Wrangler config.
const clientEntries = readdirSync(clientDir);

for (const clientEntry of clientEntries) {
  cpSync(new URL(clientEntry, clientDir), new URL(clientEntry, distDir), {
    force: true,
    recursive: true,
  });
}

mkdirSync(legacyWorkerDir, { recursive: true });
writeFileSync(
  fileURLToPath(new URL("index.js", legacyWorkerDir)),
  [
    "// Temporary compatibility shim for the default-branch preview workflow.",
    "// Astro 6 emits the Cloudflare entrypoint into dist/server/entry.mjs.",
    'export { default } from "../server/entry.mjs";',
    'export * from "../server/entry.mjs";',
    "",
  ].join("\n"),
);
