import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7871
  test("uses the system disabled color in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView({
        visual,
        box: q.article("Disabled"),
        colorScheme,
        item: "ariakit-ui-input/forced-colors/disabled",
      });
    });
  });

  // The wrapper and its icon read the disabled state from the input, which
  // application code can set after render.
  // https://github.com/ariakit/ariakit/issues/7871
  test("uses the system disabled color on the wrapper of a disabled input in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      const box = q.article("Field with leading icon");
      const input = query(box).textbox("Filter components");
      await input.evaluate((node) => node.setAttribute("disabled", ""));
      await test.expect(input).toBeDisabled();
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-input/forced-colors/disabled-wrapper",
      });
    });
  });
});
