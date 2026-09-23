import {
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/tooltip/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("shows the live tooltip over its anchor on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/tooltip/test-browser/shows-the-live-tooltip-over-its-anchor-on-hover",
    );
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
