import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("show/hide with click", async ({ page, q }) => {
    await page.setViewportSize({ width: 480, height: 480 });
    await test.expect(q.menu()).not.toBeVisible();
    await q.button("Options").click();
    await test.expect(q.menu()).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await test.expect(q.menuitem("Edit")).toHaveCSS("opacity", "1");
    const menuBox = await q.menu().boundingBox();
    const buttonBox = await q.button("Options").boundingBox();
    if (!menuBox || !buttonBox) {
      throw new Error("Menu geometry is missing");
    }
    test.expect(menuBox.y).toBeGreaterThan(buttonBox.y);
  });
});
