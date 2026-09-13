import {
  captureSections,
  forEachColorScheme,
  getCapture,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
    );
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
