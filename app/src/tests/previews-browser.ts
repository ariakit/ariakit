import { expect } from "@playwright/test";
import { isFramework } from "#app/lib/framework.ts";
import { test } from "#app/test-utils/fixtures.ts";
import { viewports } from "#app/test-utils/visual.ts";

const TIMEOUT_PER_STEP = 20_000;

// Loading regions and skeleton placeholders finish on their own timers, and the
// placeholders keep the size of the content, so the stable clip wait in
// visual() can't tell them apart.
// https://github.com/ariakit/ariakit/issues/7996
const LOADING_SELECTOR = [
  "[aria-busy='true']",
  // Parts in the 150 ms before a skeleton shows them, including in previews
  // without a loading region.
  "[data-pending]",
  // A skeleton can keep its placeholders for 200 ms after its region loads.
  // Only the animation classes mark that state, so a root with $animate={false}
  // is not covered. The region scope skips previews that never finish loading.
  ":is([aria-busy], [aria-busy] *):is(.skeleton-shimmer, .skeleton.animate-pulse)",
].join(", ");

// Covers hydration and the slowest simulated request (1.8 s).
const LOADING_TIMEOUT = 10_000;

// Hides content that changes between runs, such as measured durations. The
// elements keep their space, and visual() doesn't reload the page.
const HIDDEN_CONTENT = new Map([["skeleton/timing", "dd"]]);

async function getPreviewPaths(baseURL: string) {
  const resPreviews = await fetch(new URL("/previews", baseURL));
  if (!resPreviews.ok) {
    throw new Error(`Failed to fetch previews: ${resPreviews.status}`);
  }
  return (await resPreviews.json()) as string[];
}

test.describe.configure({ retries: 0 });

test("previews @visual", async ({ page, baseURL, visual }) => {
  test.skip(!process.env.VISUAL_TEST);
  if (!baseURL) {
    throw new Error("Missing baseURL");
  }
  const paths = await getPreviewPaths(baseURL);
  test.setTimeout(paths.length * TIMEOUT_PER_STEP);

  for (const path of paths) {
    await test.step(
      path,
      async () => {
        await page.goto(path);
        const id = path.replace(/^\/+/, "");
        const preview = /^([^/]+)\/previews\/(.+?)\/?$/.exec(id);
        const framework = preview?.[1];
        if (!isFramework(framework) || !preview?.[2]) {
          throw new Error(`Unexpected preview path: ${path}`);
        }
        await expect(page.locator(LOADING_SELECTOR)).toHaveCount(0, {
          timeout: LOADING_TIMEOUT,
        });
        const hiddenContent = HIDDEN_CONTENT.get(preview[2]);
        if (hiddenContent) {
          await page.addStyleTag({
            content: `${hiddenContent} { visibility: hidden !important; }`,
          });
        }
        await visual({
          item: `previews/${preview[2]}`,
          framework,
          viewports,
        });
      },
      { timeout: TIMEOUT_PER_STEP },
    );
  }
});
