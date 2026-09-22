import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test(
    "page @visual",
    { annotation: { type: "ariviso:item", description: "ui/checkbox/page" } },
    async ({ page, visual }) => {
      await forEachColorScheme(page, (colorScheme) =>
        capturePage(page, visual, colorScheme),
      );
    },
  );

  test(
    "draws the ring of a focused field on its box @visual",
    {
      annotation: {
        type: "ariviso:item",
        description: "ui/checkbox/draws-the-ring-of-a-focused-field-on-its-box",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Checkbox field");
        const input = query(box).checkbox("Remember me");
        await tabTo(page, input);
        await expectFocusVisible(input);
        await captureInView(visual, box, colorScheme);
      });
    },
  );
});
