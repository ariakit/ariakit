import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3997271869
  test("keeps badge boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const [key, title] of [
        ["default", "Default"],
        ["brand", "Brand"],
      ] as const) {
        const box = q.article(title);
        await captureInView({
          visual,
          box,
          colorScheme,
          item: `ariakit-ui-badge/forced-colors/${key}`,
          id: title,
        });
      }
    });
  });
});
