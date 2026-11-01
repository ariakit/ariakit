import {
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // The thumb has an adaptive edge, which shows only in high contrast.
  test("page in high contrast @visual", async ({ page, visual }) => {
    await page.emulateMedia({ contrast: "more" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(prefers-contrast: more)");
      await capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-segmented-control/high-contrast",
      });
    });
  });
});
