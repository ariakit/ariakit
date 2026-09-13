import {
  captureSections,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // The section captures keep the static values of the layer fixture under
  // visual regression: numeric zero hue, chroma, lightness, text and edge
  // values.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019400
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974545415
  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
    );
  });
});
