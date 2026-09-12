import {
  capturePage,
  captureInView,
  forEachColorScheme,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  // https://github.com/ariakit/ariakit/issues/7478
  test("default shape on hover @visual", async ({ page, q, visual }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Default");
      const button = query(box).button("What is Ariakit?");
      await button.click();
      await test.expect(button).toHaveAttribute("aria-expanded", "false");
      await hoverOver(button);
      await captureInView(visual, box, colorScheme);
    });
  });
});
