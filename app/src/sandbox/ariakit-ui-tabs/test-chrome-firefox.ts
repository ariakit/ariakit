import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3997273277
  test("keeps unselected tabs borderless in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const title of [
        "Flat tabs",
        "Bevel tabs",
        "Flat glider",
        "Bevel glider",
      ]) {
        const box = q.article(title);
        const tabs = query(box).tab();
        await test.expect(tabs).toHaveCount(3);
        for (const tab of await tabs.all()) {
          await test.expect(tab).toHaveCSS("border-top-width", "0px");
        }
        await captureInView(visual, box, colorScheme, { id: title });
      }
    });
  });
});
