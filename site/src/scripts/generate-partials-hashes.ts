/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createLogger } from "#app/lib/logger.ts";
import { getHashFromHeader, getHashKey } from "#app/lib/partials.ts";

const logger = createLogger("partials-hashes");

const BASE_URL = process.env.PARTIALS_BASE_URL || "http://localhost:4321";

// Sharding configuration for CI parallelization
// Preferred: PARTIALS_SHARD in the form "1/4" (1-based index / total)
// Backwards compat: PARTIALS_SHARD_INDEX (0-based) + PARTIALS_TOTAL_SHARDS
const SHARD_SPEC = process.env.PARTIALS_SHARD || "";
const parsedShard = parseShardSpec(SHARD_SPEC);
const FALLBACK_INDEX = Number.parseInt(
  process.env.PARTIALS_SHARD_INDEX ?? "-1",
);
const FALLBACK_TOTAL = Number.parseInt(
  process.env.PARTIALS_TOTAL_SHARDS ?? "0",
);
const SHARD_INDEX = parsedShard ? parsedShard.index : FALLBACK_INDEX;
const TOTAL_SHARDS = parsedShard ? parsedShard.total : FALLBACK_TOTAL;
const IS_SHARDED = SHARD_INDEX >= 0 && TOTAL_SHARDS > 0;

// When present, write per-shard output as a patch file instead of updating the
// main JSON. The merge job will combine all shard files. If set, the script
// will create a file: `${PARTIALS_SHARD_OUT_DIR}/shard-${SHARD_INDEX}.json`.
const SHARD_OUT_DIR = process.env.PARTIALS_SHARD_OUT_DIR || "";

const OUTPUT_FILE = path.resolve(process.cwd(), "src/partials-hashes.json");

type PartialHashes = Record<string, string>;
type HashEntry = readonly [string, string];

function parseShardSpec(spec: string): { index: number; total: number } | null {
  const parts = spec.split("/");
  if (parts.length !== 2) return null;
  const index1 = Number(parts[0]?.trim());
  const total = Number(parts[1]?.trim());
  if (!Number.isInteger(index1) || !Number.isInteger(total) || total <= 0) {
    return null;
  }
  if (index1 < 1 || index1 > total) return null;
  return { index: index1 - 1, total };
}

// Avoid brittle sleeps by polling until the preview server is reachable.
// This reduces flakes in CI and local runs where the server may start slower.
async function waitForServer(url: string, timeoutMs = 60_000) {
  const start = Date.now();
  while (true) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok || res.status === 405) return;
    } catch {}
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Server not ready at ${url} after ${timeoutMs}ms`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// Small helpers keep the control flow readable and intentions clear.
function getApiUrl(baseUrl: string) {
  return new URL("/partials", baseUrl).toString();
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

function sortPaths(paths: string[]) {
  return [...paths].sort((a, b) => a.localeCompare(b));
}

// Deterministic sharding keeps shard membership stable across runs.
function applyShard(paths: string[], index: number, total: number) {
  if (index < 0 || total <= 0) return paths;
  if (index >= total) {
    throw new Error(
      `Invalid shard configuration: index=${index}, total=${total}`,
    );
  }
  return paths.filter((_, i) => i % total === index);
}

// Stable stringify avoids false negatives in change detection if key order
// differs.
function stableStringify(object: PartialHashes) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(object).sort((a, b) => a[0].localeCompare(b[0])),
    ),
    null,
    2,
  );
}

function mergeAndDiff(previous: PartialHashes, patch: PartialHashes) {
  let numNew = 0;
  let numUpdated = 0;
  let numUnchanged = 0;
  for (const [key, hash] of Object.entries(patch)) {
    const prev = previous[key];
    if (prev === undefined) numNew += 1;
    else if (prev !== hash) numUpdated += 1;
    else numUnchanged += 1;
  }
  const next: PartialHashes = { ...previous, ...patch };
  const nextSorted = Object.fromEntries(
    Object.entries(next).sort((a, b) => a[0].localeCompare(b[0])),
  );
  const changed =
    `${stableStringify(previous)}\n` !== `${stableStringify(nextSorted)}\n`;
  return { nextSorted, counts: { numNew, numUpdated, numUnchanged }, changed };
}

async function readJsonFile(filePath: string): Promise<PartialHashes> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as PartialHashes;
  } catch {
    return {};
  }
}

async function atomicWriteJson(filePath: string, object: PartialHashes) {
  const content = `${stableStringify(object)}\n`;
  const tmpFile = `${filePath}.tmp`;
  await writeFile(tmpFile, content, "utf8");
  await rename(tmpFile, filePath);
}

// Backoff on transient fetch errors to be resilient against preview start
// races.
async function fetchHashEntry(
  partialPath: string,
  baseUrl: string,
  timeoutMs = 10_000,
) {
  const url = new URL(partialPath, baseUrl);
  const key = getHashKey(url);
  const maxAttempts = 3;
  let attempt = 0;
  while (true) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const span = logger.start();
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
        const hash = getHashFromHeader(res.headers);
        if (!hash) throw new Error("No hash in header");
        return [key, hash] as HashEntry;
      } finally {
        clearTimeout(id);
        span.info("%s", key.replace(/^\/[^/]+\/[^/]+\/[^/]+/, ""));
      }
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts) throw error;
      const delayMs = 1000 * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function buildPatchMap(paths: string[]) {
  const entries: HashEntry[] = [];
  for (const path of paths) {
    const entry = await fetchHashEntry(path, BASE_URL);
    entries.push(entry);
  }
  return Object.fromEntries(
    entries.sort((a, b) => a[0].localeCompare(b[0])),
  ) as PartialHashes;
}

async function main() {
  const apiUrl = getApiUrl(BASE_URL);
  await waitForServer(apiUrl).catch(() => {});

  const fetchLogger = logger.start();
  let partialPaths = await fetchJSON<string[]>(apiUrl);
  fetchLogger.info(
    "Fetched %d partial paths from %s",
    partialPaths.length,
    apiUrl,
  );

  // Sort first so shard assignment remains stable across runs and environments.
  partialPaths = sortPaths(partialPaths);
  const totalBeforeShard = partialPaths.length;
  partialPaths = IS_SHARDED
    ? applyShard(partialPaths, SHARD_INDEX, TOTAL_SHARDS)
    : partialPaths;

  if (IS_SHARDED) {
    logger.info(
      "Computing hashes for %d/%d partials (shard %d of %d)",
      partialPaths.length,
      totalBeforeShard,
      SHARD_INDEX + 1,
      TOTAL_SHARDS,
    );
  } else {
    logger.info("Computing hashes for %d partials", partialPaths.length);
  }
  const computeLogger = logger.start();
  const patchMap = await buildPatchMap(partialPaths);
  computeLogger.info("Computed %d hashes", Object.keys(patchMap).length);

  const writeLogger = logger.start();

  // If a shard output directory is set, write only this shard's entries
  // to a per-shard file and exit. The merge job will combine these patches.
  if (SHARD_OUT_DIR) {
    const shardDir = path.resolve(process.cwd(), SHARD_OUT_DIR);
    const shardFile = path.join(shardDir, `shard-${SHARD_INDEX + 1}.json`);
    await mkdir(path.dirname(shardFile), { recursive: true });
    const shardContent = `${JSON.stringify(patchMap, null, 2)}\n`;
    await writeFile(shardFile, shardContent, "utf8");
    return writeLogger.info(
      "Wrote shard file with %d entries to %s",
      Object.keys(patchMap).length,
      path.relative(process.cwd(), shardFile),
    );
  }

  // Otherwise, update the main JSON file by applying only the changed keys
  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  const previousMap = await readJsonFile(OUTPUT_FILE);
  const { nextSorted, counts, changed } = mergeAndDiff(previousMap, patchMap);
  if (!changed) {
    return writeLogger.info(
      "No changes to partial hashes (%d unchanged)",
      counts.numUnchanged,
    );
  }

  await atomicWriteJson(OUTPUT_FILE, nextSorted);
  writeLogger.info(
    "Updated %d keys (%d new, %d changed, %d unchanged) in %s",
    counts.numNew + counts.numUpdated,
    counts.numNew,
    counts.numUpdated,
    counts.numUnchanged,
    path.relative(process.cwd(), OUTPUT_FILE),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
