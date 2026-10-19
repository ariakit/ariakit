import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// The previews that load data. Animations never finishes loading, and
// Thumbnails has no loading state.
const previews = ["", "article", "feed", "settings", "table", "timing"];

// A skeleton shows its placeholders 150 ms after loading starts.
const SKELETON_DELAY = 150;

withFramework(import.meta.dirname, async ({ framework, id, test }) => {
  for (const name of previews) {
    const preview = name ? `${id}/${name}` : id;

    // https://github.com/ariakit/ariakit/issues/7996
    test(`shows the ${preview} placeholders while loading @visual`, async ({
      page,
      q,
      visual,
    }) => {
      // The paused clock keeps the request pending, so the capture always shows
      // the placeholders, no matter how fast the runner is. The clock keeps
      // running after install, and pauseAt can't move back in time.
      await page.clock.install();
      await page.clock.pauseAt(Date.now() + 1000);
      await page.goto(`/${framework}/previews/${preview}/`);
      await page.waitForFunction(isPreviewHydrated);
      await test.expect(q.status()).toHaveText(/^Loading /);
      // The placeholders are hidden from assistive technologies, and only the
      // pending marker tells whether they are painted.
      const pending = page.locator("[data-pending]");
      await test.expect(pending).not.toHaveCount(0);
      await page.clock.runFor(SKELETON_DELAY);
      await test.expect(pending).toHaveCount(0);
      await test.expect(q.status()).toHaveText(/^Loading /);
      await visual({ item: `${preview}/loading`, framework });
    });
  }
});
