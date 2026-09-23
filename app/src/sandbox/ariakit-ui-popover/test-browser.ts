import {
  capturePage,
  forEachColorScheme,
  getCapture,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/popover/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("floats the live popover away from its disclosure @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/popover/test-browser/floats-the-live-popover-away-from-its-disclosure",
    );
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
