import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // Forced colors remove the fill of an avatar and the ring of a group, so the
  // avatar draws a border.
  test("keeps avatar boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [key, title] of [
        ["default", "Default"],
        ["colors", "Colors"],
        ["group", "Group"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-avatar/forced-colors/${key}`,
        });
      }
    });
  });
});
