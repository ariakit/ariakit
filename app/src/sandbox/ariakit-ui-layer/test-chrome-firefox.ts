import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // An adaptive text color targets nested text and icons directly, so the
  // disabled buttons of this card need the system color on the same targets.
  // https://github.com/ariakit/ariakit/issues/7871
  // The icon of an enabled button with an adaptive text color uses the system
  // text color of the button, like the label.
  // https://github.com/ariakit/ariakit/issues/7873
  test("uses system colors on colored text and icons in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView({
        visual,
        box: q.article("Text color modifiers"),
        colorScheme,
        item: "ariakit-ui-layer/forced-colors/text-color-modifiers",
      });
    });
  });
});
