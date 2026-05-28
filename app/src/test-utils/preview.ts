import { readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { query } from "@ariakit/test/playwright";
import { frameworks, getIndexFile } from "#app/lib/frameworks.ts";
import { keys } from "#app/lib/object.ts";
import { test } from "./fixtures.ts";

const SRC_DIR = resolve(import.meta.dirname, "..");

function getPreviewId(dirname: string) {
  const relativeDir = relative(SRC_DIR, dirname);
  const [kind, ...idParts] = relativeDir.split(/[\\/]/);
  if (kind !== "examples" && kind !== "sandbox") return null;
  if (!idParts.length) return null;
  return idParts.join("/");
}

function getPreviewFramworks(dirname: string) {
  const files = readdirSync(dirname);
  const frameworkNames: (keyof typeof frameworks)[] = [];
  for (const framework of keys(frameworks)) {
    const indexFile = getIndexFile(framework);
    if (indexFile && files.includes(indexFile)) {
      frameworkNames.push(framework);
    }
  }
  return frameworkNames;
}

interface WithFrameworkCallbackParams {
  id: string;
  test: typeof test;
  framework: keyof typeof frameworks;
  query: typeof query;
}

export function withFramework(
  dirname: string,
  callback: (params: WithFrameworkCallbackParams) => Promise<void>,
) {
  const id = getPreviewId(dirname);
  if (!id) {
    throw new Error(`Cannot parse preview id from ${dirname}`);
  }
  const frameworkNames = id.includes("nextjs")
    ? (["react"] as const)
    : getPreviewFramworks(dirname);
  for (const framework of frameworkNames) {
    test.describe(framework, { tag: `@${framework}` }, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/${framework}/previews/${id}/`, {
          // Perf runs re-navigate this page repeatedly under a single timeout,
          // where `networkidle`'s unbounded wait can stall on a contended CI
          // runner. Use the bounded `load` event for them; keep `networkidle`
          // for visual and browser tests so async content settles first.
          waitUntil: process.env.PERF_TEST === "true" ? "load" : "networkidle",
        });
      });
      return callback({ id, framework, query, test });
    });
  }
}
