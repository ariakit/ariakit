import {
  captureInView,
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  test("keeps marker shapes and guides in forced colors @visual", async ({
    page,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-list/forced-colors/page",
      });
    });
  });

  // A disabled row sets the system disabled color on its descendants, so the
  // checked marker must keep the selection color of its check. Application code
  // can disable a step after render.
  // https://github.com/ariakit/ariakit/issues/7871
  test("keeps the check of a disabled step readable in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      const box = q.article("Disclosure steps");
      const button = query(box).button(/Connect the repository/);
      await button.evaluate((node) => node.setAttribute("disabled", ""));
      await test.expect(button).toBeDisabled();
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-list/forced-colors/disabled-checked-step",
      });
    });
  });
});
