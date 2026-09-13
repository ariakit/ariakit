import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  test("keeps the frame and popover boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView(visual, q.article("Default"), colorScheme);
    });
  });
});
