import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("keeps flat key boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const [key, title] of [
        ["flat-keys", "Flat keys"],
        ["shortcut-slots", "Keys in shortcut slots"],
      ] as const) {
        const box = q.article(title);
        await captureInView({
          visual,
          box,
          colorScheme,
          item: `ariakit-ui-kbd/forced-colors/${key}`,
        });
      }
    });
  });
});
