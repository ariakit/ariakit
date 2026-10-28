import {
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // A bar outside its tab inverts from the surface behind the tab. It used to
  // invert from the tab, which a pushed tab turns light in high contrast, so
  // the bar painted dark on the dark surface behind it.
  test("page in high contrast @visual", async ({ page, visual }) => {
    await page.emulateMedia({ contrast: "more" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(prefers-contrast: more)");
      await capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-tabs/page",
      });
    });
  });
});
