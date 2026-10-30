import {
  captureInView,
  expectMedia,
  forEachColorSchemeOf,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // Forced colors repaint every background in the system canvas and drop
  // box-shadows and gradients, which used to leave nothing of a bar or a ring.
  test("keeps bars and rings visible in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    // The emulation lasts across the reloads of each color scheme.
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Default", "Ring with label"],
      async (colorScheme) => {
        await expectMedia(page, "(forced-colors: active)");
        await captureInView({
          visual,
          box: q.article("Default"),
          colorScheme,
          item: "ariakit-ui-progress/forced-colors/bar",
        });
        await captureInView({
          visual,
          box: q.article("Ring with label"),
          colorScheme,
          item: "ariakit-ui-progress/forced-colors/ring",
        });
      },
    );
  });
});
