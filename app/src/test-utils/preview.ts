import { readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { query } from "@ariakit/test/playwright";
import { errors } from "@playwright/test";
import type { Page } from "@playwright/test";
import { frameworks, getIndexFile } from "#app/lib/frameworks.ts";
import { keys } from "#app/lib/object.ts";
import { test } from "./fixtures.ts";

/**
 * Navigates to `url` and waits for it to be ready for a browser test. Waits for
 * the bounded `load` event rather than `networkidle`: under CI contention,
 * networkidle's unbounded "no requests for 500ms" wait can stall past the test
 * timeout. After `load`, still wait for network idle so late work (such as
 * `client:load` island hydration) settles, but cap it so a stalled or chatty
 * request degrades to a short wait instead of consuming the test budget. Only
 * the bounded settle timing out is expected; rethrow real failures such as the
 * page or context closing.
 *
 * Kept in sync with the copy in `packages/ariakit-scripts/src/perf.ts`.
 */
async function gotoAndSettle(page: Page, url: string) {
  await page.goto(url, { waitUntil: "load" });
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch((error) => {
      if (!(error instanceof errors.TimeoutError)) throw error;
    });
}

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
        await gotoAndSettle(page, `/${framework}/previews/${id}/`);
      });
      return callback({ id, framework, query, test });
    });
  }
}
