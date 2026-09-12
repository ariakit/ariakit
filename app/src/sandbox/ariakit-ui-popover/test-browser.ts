import {
  captureInView,
  capturePage,
  expectMedia,
  forEachColorScheme,
  getCapture,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

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

  test("floats the live popover away from its disclosure @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await q.button("Event details").click();
      const popover = q.dialog("Design review");
      await test.expect(popover).toBeVisible();
      await visual(
        getCapture(popover, colorScheme, { clipMargin: OVERLAY_CLIP_MARGIN }),
      );
    });
  });
});
