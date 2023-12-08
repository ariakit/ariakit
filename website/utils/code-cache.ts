import crypto from "node:crypto";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { packageDirectory } from "pkg-dir";
import type { IThemedToken } from "shiki";
import { desia, sia } from "sializer";

const ROOT_DIR = await packageDirectory({
  cwd: new URL(import.meta.url).pathname,
});
if (!ROOT_DIR) throw new Error("Could not find root directory");
const CACHE_DIR = path.resolve(ROOT_DIR, ".code-cache");
const CACHE_DATA_PATH = path.resolve(CACHE_DIR, "data");
const CACHE_SEEN_PATH = path.resolve(CACHE_DATA_PATH, "seen");

const DISABLE_CODE_CACHE = process.env.DISABLE_CODE_CACHE === "true";
const UPDATE_CODE_CACHE = process.env.UPDATE_CODE_CACHE === "true";
const DEBUG_CODE_CACHE = process.env.DEBUG_CODE_CACHE === "true";

const CODE_CACHE = {
  _initPromise: false as Promise<void> | false,
  async init() {
    if (UPDATE_CODE_CACHE) await fs.mkdir(CACHE_DATA_PATH, { recursive: true });
  },
  memory: new Map<string, IThemedToken[][]>(),
  async waitForInit() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this.init();
    return this._initPromise;
  },
  markSeen(key: string) {
    if (UPDATE_CODE_CACHE)
      return fsSync.appendFileSync(CACHE_SEEN_PATH, key + "\n");
  },
  persist(key: string, content: Buffer) {
    if (UPDATE_CODE_CACHE)
      return fsSync.writeFileSync(path.resolve(CACHE_DATA_PATH, key), content);
  },
  async getOrCreate(
    code: string,
    theme: "light" | "dark",
    create: () => Promise<IThemedToken[][]>,
  ): Promise<IThemedToken[][]> {
    await this.waitForInit();

    const memoryKey = `${code}-${theme}`;

    // in memory
    const memoryValue = this.memory.get(memoryKey);
    if (memoryValue) return memoryValue;

    // not in memory and cache is disabled
    if (DISABLE_CODE_CACHE) {
      const value = await create();
      this.memory.set(memoryKey, value);
      return value;
    }

    const hash = crypto.createHash("md5").update(code).digest("hex");
    const key = `${hash}-${theme}`;

    // in disk
    this.markSeen(key);
    try {
      const value = desia(
        await fs.readFile(path.resolve(CACHE_DATA_PATH, key)),
      ) as IThemedToken[][];
      this.memory.set(memoryKey, value);
      if (DEBUG_CODE_CACHE) console.log(`CODE CACHE HIT: ${key}`);
      return value;

      // not in disk
    } catch (error) {
      if ((error as any)?.code !== "ENOENT") {
        console.error(
          `CODE CACHE ERROR: skipped cache for item with key ${key}`,
        );
        console.error(error);
      }
      if (DEBUG_CODE_CACHE) console.log(`CODE CACHE MISS: ${key}`);
      const value = await create();
      this.memory.set(memoryKey, value);
      this.persist(key, sia(value));
      return value;
    }
  },
};
export const CODE_CACHE_GET_OR_CREATE = CODE_CACHE.getOrCreate.bind(
  CODE_CACHE,
) as (
  code: string,
  theme: "light" | "dark",
  create: () => Promise<IThemedToken[][]>,
) => Promise<IThemedToken[][]>;
