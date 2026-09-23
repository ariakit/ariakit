import {
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/heading/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("underlines a permalink on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem("ui/heading/test-browser/underlines-a-permalink-on-hover");
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Permalink");
      await hoverOver(query(box).link("Anchored heading"));
      await visual(getCapture(box, colorScheme));
    });
  });
});
