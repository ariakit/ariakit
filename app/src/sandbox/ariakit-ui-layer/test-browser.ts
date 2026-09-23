import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // The page capture keeps the static values of the layer fixture under visual
  // regression: numeric zero hue, chroma, lightness, text and edge values.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019400
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974545415
  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/layer/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });
});
