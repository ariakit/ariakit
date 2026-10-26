import {
  forEachColorScheme,
  getCapture,
  hoverOver,
  OVERLAY_CLIP_MARGIN,
} from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import { tooltips } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ id, test }) => {
  for (const { button, text, item } of tooltips) {
    test(`shows the ${item} tooltip @visual`, async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        await hoverOver(q.button(button));
        const tooltip = q.tooltip(text);
        await test.expect(tooltip).toBeVisible();
        await visual(
          getCapture(tooltip, colorScheme, {
            item: `${id}/${item}`,
            clipMargin: OVERLAY_CLIP_MARGIN,
          }),
        );
      });
    });
  }
});
