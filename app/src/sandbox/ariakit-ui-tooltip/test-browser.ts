import {
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test(
    "page @visual",
    { annotation: { type: "ariviso:item", description: "ui/tooltip/page" } },
    async ({ page, visual }) => {
      await forEachColorScheme(page, (colorScheme) =>
        capturePage(page, visual, colorScheme),
      );
    },
  );

  test(
    "shows the live tooltip over its anchor on hover @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/tooltip/shows-the-live-tooltip-over-its-anchor-on-hover",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        await hoverOver(q.button("Publish"));
        const tooltip = q.tooltip("Publish to the public site");
        await test.expect(tooltip).toBeVisible();
        await visual(
          getCapture(tooltip, colorScheme, { clipMargin: OVERLAY_CLIP_MARGIN }),
        );
      });
    },
  );
});
