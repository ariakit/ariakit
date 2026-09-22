import {
  capturePage,
  forEachColorScheme,
  getCapture,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test(
    "page @visual",
    { annotation: { type: "ariviso:item", description: "ui/popover/page" } },
    async ({ page, visual }) => {
      await forEachColorScheme(page, (colorScheme) =>
        capturePage(page, visual, colorScheme),
      );
    },
  );

  test(
    "floats the live popover away from its disclosure @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/popover/floats-the-live-popover-away-from-its-disclosure",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        await q.button("Event details").click();
        const popover = q.dialog("Design review");
        await test.expect(popover).toBeVisible();
        await visual(
          getCapture(popover, colorScheme, { clipMargin: OVERLAY_CLIP_MARGIN }),
        );
      });
    },
  );
});
