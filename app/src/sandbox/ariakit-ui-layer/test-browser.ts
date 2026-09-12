import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // The page capture keeps the static values of the layer fixture under visual
  // regression: numeric zero hue, chroma, lightness, text and edge values.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019400
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974545415
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });
});
