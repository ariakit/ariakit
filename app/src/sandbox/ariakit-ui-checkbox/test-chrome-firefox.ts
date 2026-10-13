import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // The cards disable their fields and cards through the native attribute and
  // through aria-disabled.
  // https://github.com/ariakit/ariakit/issues/7871
  test("uses the system disabled color in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [key, title] of [
        ["disabled-field-labels", "Disabled field labels"],
        ["disabled-card-badges", "Disabled card badges"],
        ["disabled-checked-card", "Disabled checked card"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-checkbox/forced-colors/${key}`,
        });
      }
    });
  });
});
