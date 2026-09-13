import {
  captureSections,
  forEachColorScheme,
  getCapture,
  hoverOver,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
    );
  });

  test("shows the live tooltip over its anchor on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await hoverOver(q.button("Publish"));
      const tooltip = q.tooltip("Publish to the public site");
      await test.expect(tooltip).toBeVisible();
      await visual(
        getCapture(tooltip, colorScheme, { clipMargin: OVERLAY_CLIP_MARGIN }),
      );
    });
  });
});
