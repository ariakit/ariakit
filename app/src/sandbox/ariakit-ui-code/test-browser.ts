import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test(
    "page @visual",
    { annotation: { type: "ariviso:item", description: "ui/code/page" } },
    async ({ page, visual }) => {
      await forEachColorScheme(page, (colorScheme) =>
        capturePage(page, visual, colorScheme),
      );
    },
  );
});
