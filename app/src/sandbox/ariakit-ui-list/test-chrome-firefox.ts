import {
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  test(
    "keeps marker shapes and guides in forced colors @visual",
    {
      annotation: {
        type: "ariviso:item",
        description: "ui/list/keeps-marker-shapes-and-guides-in-forced-colors",
      },
    },
    async ({ page, visual }) => {
      await page.emulateMedia({ forcedColors: "active" });
      await forEachColorScheme(page, async (colorScheme) => {
        await expectMedia(page, "(forced-colors: active)");
        await capturePage(page, visual, colorScheme);
      });
    },
  );
});
