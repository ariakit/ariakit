import { resolve } from "node:path";
import { query } from "@ariakit/test/playwright";
import { invariant } from "@ariakit/utils";
import { errors } from "@playwright/test";
import type { Page } from "@playwright/test";
import { previewConfig } from "#app/lib/preview-config.ts";
import {
  getPreviewFrameworksSync,
  getPreviewIdFromDir,
  resolvePreviewRoots,
} from "#app/lib/preview-discovery.ts";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import type { Framework } from "#app/lib/schemas.ts";
import { test } from "./fixtures.ts";
import { waitForFonts } from "./visual.ts";

/**
 * Navigates to `url` and waits for it to be ready for a browser test. Waits for
 * the bounded `load` event rather than `networkidle`: under CI contention,
 * networkidle's unbounded "no requests for 500ms" wait can stall past the test
 * timeout. After `load`, still wait for network idle so late network work can
 * settle, but cap it so a stalled or chatty request degrades to a short wait
 * instead of consuming the test budget. Only the bounded settle timing out is
 * expected; rethrow real failures such as the page or context closing.
 *
 * The bounded load and network-idle steps are kept in sync with the helper in
 * `packages/ariakit-scripts/src/perf.ts`.
 */
export async function gotoAndSettle(page: Page, url: string) {
  await page.goto(url, { waitUntil: "load" });
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch((error) => {
      if (!(error instanceof errors.TimeoutError)) throw error;
    });
}

/**
 * Waits for animation frames in the page so effects can settle.
 *
 * Use sparingly. Prefer a retrying assertion against existing observable state.
 * When no such state exists, add a comment explaining why waiting for frames is
 * necessary.
 */
export function flushFrames(page: Page, frames = 2) {
  return page.evaluate(
    (frameCount) =>
      new Promise<void>((resolve) => {
        const tick = () => {
          if (frameCount-- <= 0) {
            resolve();
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      }),
    frames,
  );
}

const SRC_DIR = resolve(import.meta.dirname, "..");
const previewRoots = resolvePreviewRoots({ ...previewConfig, srcDir: SRC_DIR });

interface WithFrameworkCallbackParams {
  id: string;
  test: typeof test;
  framework: Framework;
  query: typeof query;
}

interface WithFrameworkOptions {
  deferVisualLoad?: boolean;
}

const previewUrls = new WeakMap<Page, string>();

/** The preview URL of a test that deferred its first load. */
export function getPreviewUrl(page: Page) {
  const url = previewUrls.get(page);
  invariant(url, "The test must run in withDeferredVisualLoad");
  return url;
}

/**
 * Runs `withFramework`, but leaves the page blank before the tests tagged
 * `@visual`, which load the preview themselves through `getPreviewUrl`. A page
 * load is the largest cost of a capture test, so a load before theirs would be
 * wasted.
 */
export function withDeferredVisualLoad(
  dirname: string,
  callback: (params: WithFrameworkCallbackParams) => Promise<void>,
) {
  withFramework(dirname, callback, { deferVisualLoad: true });
}

export function withFramework(
  dirname: string,
  callback: (params: WithFrameworkCallbackParams) => Promise<void>,
  { deferVisualLoad = false }: WithFrameworkOptions = {},
) {
  const id = getPreviewIdFromDir(previewRoots, resolve(dirname));
  if (!id) {
    throw new Error(`Cannot parse preview id from ${dirname}`);
  }
  const isNextjs = id.includes("nextjs");
  const frameworkNames: readonly Framework[] = isNextjs
    ? ["react"]
    : getPreviewFrameworksSync(dirname);
  for (const framework of frameworkNames) {
    test.describe(framework, { tag: `@${framework}` }, () => {
      test.beforeEach(async ({ page, javaScriptEnabled }, testInfo) => {
        const url = `/${framework}/previews/${id}/`;
        if (deferVisualLoad && testInfo.tags.includes("@visual")) {
          previewUrls.set(page, url);
          return;
        }
        // Next.js previews contain no Astro island that marks hydration and
        // prefetch routes after load, and JavaScript-disabled previews never
        // hydrate, so network idle remains their settle signal.
        if (isNextjs || !javaScriptEnabled) {
          await gotoAndSettle(page, url);
          return;
        }
        // Generated Astro previews contain one eager client:load island. Its
        // wrapper marks the document from a mount effect after the example
        // commits. That mark replaces the network-idle wait, which costs a
        // fixed 500ms quiet window in each test.
        await page.goto(url, { waitUntil: "load" });
        await page.waitForFunction(isPreviewHydrated);
        // Some previews, such as those that render into a shadow root, start
        // loading the font only when they render text after hydration.
        await waitForFonts(page);
      });
      return callback({ id, framework, query, test });
    });
  }
}
