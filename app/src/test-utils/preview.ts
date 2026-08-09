import { relative, resolve } from "node:path";
import { query } from "@ariakit/test/playwright";
import { errors } from "@playwright/test";
import type { Page } from "@playwright/test";
import { isInDirectory, toPosixPath } from "#app/lib/paths.ts";
import { previewConfig } from "#app/lib/preview-config.ts";
import {
  getPreviewFrameworksSync,
  resolvePreviewRoots,
} from "#app/lib/preview-discovery.ts";
import type { Framework } from "#app/lib/schemas.ts";
import { test } from "./fixtures.ts";

interface PreviewNavigationOptions {
  waitForHydration?: boolean;
}

/**
 * Navigates to `url` and waits for it to be ready for a browser test. Waits for
 * the bounded `load` event rather than `networkidle`: under CI contention,
 * networkidle's unbounded "no requests for 500ms" wait can stall past the test
 * timeout. After `load`, still wait for network idle so late work (such as
 * `client:load` island hydration) settles, but cap it so a stalled or chatty
 * request degrades to a short wait instead of consuming the test budget. Then
 * wait for Astro to hand every island to its renderer so tests do not interact
 * with server-rendered controls when `waitForHydration` is enabled. Keep that
 * disabled for full site pages, which can contain lazy offscreen islands. Only
 * the bounded settle timing out is expected; rethrow real failures such as the
 * page or context closing.
 *
 * Kept in sync with the copy in `packages/ariakit-scripts/src/perf.ts`.
 */
export async function gotoAndSettle(
  page: Page,
  url: string,
  options: PreviewNavigationOptions = {},
) {
  await page.goto(url, { waitUntil: "load" });
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch((error) => {
      if (!(error instanceof errors.TimeoutError)) throw error;
    });
  if (options.waitForHydration) {
    await page.waitForFunction(
      () => !document.querySelector("astro-island[ssr]"),
    );
  }
}

/**
 * Waits for animation frames in the page so effects can settle.
 *
 * Use sparingly. Prefer a retrying assertion against existing observable
 * state. When no such state exists, add a comment explaining why waiting for
 * frames is necessary.
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

function getPreviewId(dirname: string) {
  const dir = resolve(dirname);
  for (const root of previewRoots) {
    if (!isInDirectory(dir, root.dir)) continue;
    const id = toPosixPath(relative(root.dir, dir));
    if (!id) return null;
    return id;
  }
  return null;
}

interface WithFrameworkCallbackParams {
  id: string;
  test: typeof test;
  framework: Framework;
  query: typeof query;
}

export function withFramework(
  dirname: string,
  callback: (params: WithFrameworkCallbackParams) => Promise<void>,
  options: PreviewNavigationOptions = { waitForHydration: true },
) {
  const id = getPreviewId(dirname);
  if (!id) {
    throw new Error(`Cannot parse preview id from ${dirname}`);
  }
  const frameworkNames: readonly Framework[] = id.includes("nextjs")
    ? ["react"]
    : getPreviewFrameworksSync(dirname);
  for (const framework of frameworkNames) {
    test.describe(framework, { tag: `@${framework}` }, () => {
      test.beforeEach(async ({ page }) => {
        await gotoAndSettle(page, `/${framework}/previews/${id}/`, options);
      });
      return callback({ id, framework, query, test });
    });
  }
}

/** Runs framework previews without waiting for client-side hydration. */
export function withFrameworkBeforeHydration(
  dirname: string,
  callback: (params: WithFrameworkCallbackParams) => Promise<void>,
) {
  return withFramework(dirname, callback, { waitForHydration: false });
}
