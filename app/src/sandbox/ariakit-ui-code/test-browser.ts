import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/code/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });
});
