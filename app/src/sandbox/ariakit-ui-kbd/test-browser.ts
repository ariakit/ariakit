import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/7495#discussion_r3998667498
  test("aligns inline caps with body text", async ({ page, q }) => {
    await forEachColorScheme(page, async () => {
      await page.evaluate(() => document.fonts.ready);
      const cap = q.article("Default").locator("p kbd").first();
      await test.expect(cap).toBeVisible();
      const imbalance = await cap.evaluate((element) => {
        const paragraph = element.closest("p");
        const context = document.createElement("canvas").getContext("2d");
        if (!paragraph || !context) {
          throw new Error("The cap needs paragraph font metrics");
        }
        const font = getComputedStyle(paragraph);
        context.font = font.font;
        const ascent = context.measureText("H").actualBoundingBoxAscent;
        const descent = context.measureText("p").actualBoundingBoxDescent;
        // A zero-size marker locates the text baseline without changing layout.
        const marker = document.createElement("span");
        marker.style.cssText =
          "display:inline-block;width:0;height:0;vertical-align:baseline";
        element.after(marker);
        const baseline = marker.getBoundingClientRect().top;
        const bounds = element.getBoundingClientRect();
        marker.remove();
        const above = baseline - ascent - bounds.top;
        const below = bounds.bottom - baseline - descent;
        return Math.abs(above - below);
      });
      // Allow subpixel differences in text ink across platform rasterizers.
      test.expect(imbalance).toBeLessThan(1);
    });
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });
});
