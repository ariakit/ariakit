import {
  captureInView,
  expectMedia,
  forEachColorSchemeOf,
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
    await forEachColorSchemeOf(page, ["Default"], async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView({
        visual,
        box: q.article("Default"),
        colorScheme,
        item: "ariakit-ui-popover/forced-colors/default",
      });
    });
  });
});
