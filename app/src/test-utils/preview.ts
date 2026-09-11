import { relative, resolve } from "node:path";
import { query } from "@ariakit/test/playwright";
import { invariant } from "@ariakit/utils";
import { errors } from "@playwright/test";
import type { Page } from "@playwright/test";
import { isInDirectory, toPosixPath } from "#app/lib/path.ts";
import { previewConfig } from "#app/lib/preview-config.ts";
import {
  getPreviewFrameworksSync,
  getPreviewRoutesSync,
  resolvePreviewRoots,
} from "#app/lib/preview-discovery.ts";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { getPreviewPath } from "#app/lib/preview-routes.ts";
import type { Framework } from "#app/lib/schemas.ts";
import { test } from "./fixtures.ts";

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

interface WithFrameworkOptions {
  /** A route declared in the preview's `preview.json` `routes` list. */
  route?: string;
}

type WithFrameworkCallback = (
  params: WithFrameworkCallbackParams,
) => Promise<void>;

/**
 * Waits until the preview island has committed. Call it after a navigation that
 * `withFramework` did not perform, such as a link click.
 */
export async function waitForPreviewHydration(page: Page) {
  await page.waitForFunction(isPreviewHydrated);
}

export function withFramework(
  dirname: string,
  callback: WithFrameworkCallback,
): void;
export function withFramework(
  dirname: string,
  options: WithFrameworkOptions,
  callback: WithFrameworkCallback,
): void;
export function withFramework(
  dirname: string,
  ...args:
    | [WithFrameworkCallback]
    | [WithFrameworkOptions, WithFrameworkCallback]
) {
  const [options, callback] = args.length === 1 ? [{}, args[0]] : args;
  const { route } = options;
  const id = getPreviewId(dirname);
  if (!id) {
    throw new Error(`Cannot parse preview id from ${dirname}`);
  }
  // A mistyped route loads the 404 page, which has no islands. The hydration
  // wait would pass at once and the test would fail for a confusing reason.
  if (route) {
    invariant(
      getPreviewRoutesSync(dirname).includes(route),
      `Unknown route "${route}" for preview ${id}`,
    );
  }
  const frameworkNames: readonly Framework[] = id.includes("nextjs")
    ? ["react"]
    : getPreviewFrameworksSync(dirname);
  for (const framework of frameworkNames) {
    // The route in the title keeps several route blocks in one file distinct,
    // which also keeps their screenshot names distinct.
    const title = route ? `${framework} ${route}` : framework;
    test.describe(title, { tag: `@${framework}` }, () => {
      test.beforeEach(async ({ page, javaScriptEnabled }) => {
        await gotoAndSettle(
          page,
          `/${getPreviewPath({ framework, id, route })}/`,
        );
        // Generated Astro previews contain one eager client:load island. Its
        // wrapper marks the document from a mount effect after the example
        // commits. JavaScript-disabled previews skip the check, while Next.js
        // previews contain no Astro island and pass through it immediately.
        if (javaScriptEnabled) {
          await waitForPreviewHydration(page);
        }
      });
      return callback({ id, framework, query, test });
    });
  }
}
