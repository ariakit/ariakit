import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3997273277
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000461790
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000913151
  test("keeps unselected tabs borderless in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const [key, title] of [
        ["flat-tabs", "Flat tabs"],
        ["bevel-tabs", "Bevel tabs"],
        ["flat-glider", "Flat glider"],
        ["bevel-glider", "Bevel glider"],
        ["borderless-flat-glider", "Borderless flat glider"],
        ["borderless-bevel-glider", "Borderless bevel glider"],
      ] as const) {
        const box = q.article(title);
        const selected = query(box).tab("Usage");
        await selected.click();
        await query(box).heading(title).click();
        await test.expect(selected).toHaveAttribute("aria-selected", "true");
        await captureInView({
          visual,
          box,
          colorScheme,
          item: `ariakit-ui-tabs/forced-colors/${key}`,
        });
      }
    });
  });
});
