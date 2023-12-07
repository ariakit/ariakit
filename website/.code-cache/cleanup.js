// see: website/utils/code-cache.ts

import fs from "node:fs/promises";
import path from "node:path";
import { packageDirectory } from "pkg-dir";
import { desia } from "sializer";

const ROOT_DIR = await packageDirectory({
  cwd: new URL(import.meta.url).pathname,
});
if (!ROOT_DIR) throw new Error("Could not find root directory");
const CACHE_DIR = path.resolve(ROOT_DIR, ".code-cache");
const CACHE_DATA_PATH = path.resolve(CACHE_DIR, "data");
const CACHE_SEEN_PATH = path.resolve(CACHE_DATA_PATH, "seen");

async function getSeenKeys() {
  const file = await fs.readFile(CACHE_SEEN_PATH, "utf8");
  return file.split("\n").filter(Boolean);
}

async function getDataKeys() {
  const files = await fs.readdir(CACHE_DATA_PATH);
  return files.filter((file) => file !== "seen");
}

async function main() {
  const seenKeys = await getSeenKeys();
  const cacheKeys = await getDataKeys();

  console.log("Cleaning up code cache...");

  // remove not seen entries from the cache
  let obsoleteEntryCount = 0;
  const remainingKeys = [];
  for (const key of cacheKeys) {
    if (seenKeys.includes(key)) {
      remainingKeys.push(key);
      continue;
    }
    await fs.unlink(path.resolve(CACHE_DATA_PATH, key));
    obsoleteEntryCount++;
  }

  // remove invalid entries from the cache
  let invalidEntryCount = 0;
  for (const key of remainingKeys) {
    try {
      desia(await fs.readFile(path.resolve(CACHE_DATA_PATH, key)));
    } catch (error) {
      console.log(`Invalid entry found: ${key}`);
      console.log(error);
      await fs.unlink(path.resolve(CACHE_DATA_PATH, key));
      invalidEntryCount++;
    }
  }

  await fs.unlink(CACHE_SEEN_PATH);

  if (obsoleteEntryCount === 0 && invalidEntryCount === 0)
    return console.log("ℹ️ No obsolete or invalid entries found.");

  console.log(`ℹ️ Removed ${obsoleteEntryCount} obsolete entries from cache.`);
  console.log(`ℹ️ Removed ${invalidEntryCount} invalid entries from cache.`);
  console.log(`ℹ️ New cache size: ${cacheKeys.length - obsoleteEntryCount}.`);
}

await main();
