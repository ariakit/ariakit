import {
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // Forced colors paint transparent borders and remove fills, so only the
  // selected segment may keep an edge. Joined cells mark it with an outline.
  test("page in forced colors @visual", async ({ page, visual }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-segmented-control/forced-colors",
      });
    });
  });

  // The outline that marks the selected cell would otherwise look the same as
  // the focus ring, which replaces it.
  test("shows keyboard focus on a selected joined cell in forced colors", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const group = page.getByRole("radiogroup", { name: "Joined cells" });
    const list = group.getByRole("radio", { name: "List" });
    const grid = group.getByRole("radio", { name: "Grid" });
    const listCell = list.locator("xpath=ancestor::label");
    const gridCell = grid.locator("xpath=ancestor::label");
    await test.expect(listCell).toHaveCSS("outline-offset", "-4px");
    await list.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(grid).toBeChecked();
    await test.expect(gridCell).toHaveCSS("outline-offset", "1px");
  });
});
