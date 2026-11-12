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

// Waits for the end state of content that advances on its own timer without a
// loading state. visual() captures every variant from the same page load, so
// each one would otherwise show the step that the timer reached.
const SETTLED_CONTENT = new Map([
  // Finishes one of five tasks every 1.5 s.
  ["list/task-progress", 'role=heading[name="Your app is live"]'],
]);

// Covers hydration and the 7.5 s that the slowest settled content takes.
const SETTLED_TIMEOUT = 15_000;

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
  test.setTimeout(
    paths.length * TIMEOUT_PER_STEP + SETTLED_CONTENT.size * SETTLED_TIMEOUT,
  );

  for (const path of paths) {
    const id = path.replace(/^\/+/, "");
    const preview = /^([^/]+)\/previews\/(.+?)\/?$/.exec(id);
    const framework = preview?.[1];
    const previewId = preview?.[2];
    if (!isFramework(framework) || !previewId) {
      throw new Error(`Unexpected preview path: ${path}`);
    }
    const settledContent = SETTLED_CONTENT.get(previewId);
    await test.step(
      path,
      async () => {
        await page.goto(path);
        await expect(page.locator(LOADING_SELECTOR)).toHaveCount(0, {
          timeout: LOADING_TIMEOUT,
        });
        if (settledContent) {
          await expect(page.locator(settledContent)).toBeVisible({
            timeout: SETTLED_TIMEOUT,
          });
        }
        const hiddenContent = HIDDEN_CONTENT.get(previewId);
        if (hiddenContent) {
          await page.addStyleTag({
            content: `${hiddenContent} { visibility: hidden !important; }`,
          });
        }
        await visual({
          item: `previews/${previewId}`,
          framework,
          viewports,
        });
      },
      {
        timeout: settledContent
          ? TIMEOUT_PER_STEP + SETTLED_TIMEOUT
          : TIMEOUT_PER_STEP,
      },
    );
  }
});
