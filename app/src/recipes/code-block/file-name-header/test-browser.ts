import {
  captureInView,
  expectFocusVisible,
  forEachColorScheme,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ id, test }) => {
  // The title is a strip without a layer, so its folder stacks with the code
  // panel. The focused panel goes up to it, so the ring crosses the title.
  test("paints the focus ring of the code across the title @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const code = q.region("format-price.ts");
      await tabTo(page, code);
      await expectFocusVisible(code);
      await captureInView({
        visual,
        box: page.locator(".ui-code-block"),
        colorScheme,
        item: `${id}/focused-code`,
      });
    });
  });
});
