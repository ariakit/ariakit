import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { largestStyleRecalculation } from "#app/test-utils/style.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page }) => {
    // Size containers move style work into layout, where Chrome omits the
    // element count. Remove that boundary and motion for this count-only probe.
    await page.addStyleTag({
      content:
        "* { container-type: normal !important; transition: none !important; }",
    });
    // The probe stylesheet must finish its own invalidation before tracing.
    await flushFrames(page);
  });

  // https://github.com/ariakit/ariakit/issues/7806
  test("keeps unrelated styles cached when a portal container is removed", async ({
    page,
    q,
  }) => {
    // A hidden container isolates the body-child mutation made by a portal from
    // the tooltip's own focus, layout, and animation work.
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.id = "portal-style-probe";
      container.hidden = true;
      document.body.insertBefore(container, document.body.lastElementChild);
    });
    // The insertion must finish its invalidation before measuring removal.
    await flushFrames(page);
    const count = await largestStyleRecalculation(page, () =>
      page.evaluate(() =>
        document.getElementById("portal-style-probe")?.remove(),
      ),
    );
    await test.expect(q.navigation("Documentation sections")).toBeVisible();
    test.expect(count).toBeLessThan((await page.locator("*").count()) / 2);
  });
});
