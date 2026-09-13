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
      for (const title of [
        "Flat tabs",
        "Bevel tabs",
        "Flat glider",
        "Bevel glider",
        "Borderless flat glider",
        "Borderless bevel glider",
      ]) {
        const box = q.article(title);
        const tabs = query(box).tab();
        await test.expect(tabs).toHaveCount(3);
        for (const name of ["Code", "Usage"]) {
          const selected = query(box).tab(name);
          await selected.click();
          await query(box).heading(title).click();
          await test.expect(selected).toHaveAttribute("aria-selected", "true");
          for (const tab of await tabs.all()) {
            const isSelected = await tab.getAttribute("aria-selected");
            const width =
              isSelected === "true" && title.endsWith("tabs") ? "1px" : "0px";
            await test.expect(tab).toHaveCSS("border-top-width", width);
          }
          if (title.endsWith("glider")) {
            await test
              .expect(box.locator(".glider.selected"))
              .toHaveCSS("border-top-width", "1px");
          }
        }
        await captureInView(visual, box, colorScheme, { id: title });
      }
    });
  });
});
