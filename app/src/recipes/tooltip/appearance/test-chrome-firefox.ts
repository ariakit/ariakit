import {
  expectMedia,
  forEachColorScheme,
  getCapture,
  hoverOver,
  OVERLAY_CLIP_MARGIN,
} from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import { tooltips } from "./test-helpers.ts";

// Forced colors paint each surface in the system colors, so the captures show
// the boundaries of the tooltips that differ only in color.
const colorItems = new Set(["inverted", "surface", "brand"]);

withFramework(import.meta.dirname, async ({ id, test }) => {
  for (const { button, text, item } of tooltips) {
    if (!colorItems.has(item)) continue;
    test(`keeps a boundary on the ${item} tooltip in forced colors @visual`, async ({
      page,
      q,
      visual,
    }) => {
      await page.emulateMedia({ forcedColors: "active" });
      await forEachColorScheme(page, async (colorScheme) => {
        await expectMedia(page, "(forced-colors: active)");
        await hoverOver(q.button(button));
        const tooltip = q.tooltip(text);
        await test.expect(tooltip).toBeVisible();
        await visual(
          getCapture(tooltip, colorScheme, {
            item: `${id}/forced-colors/${item}`,
            clipMargin: OVERLAY_CLIP_MARGIN,
          }),
        );
      });
    });
  }
});
