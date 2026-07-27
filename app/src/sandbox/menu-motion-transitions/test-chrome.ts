import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("show/hide with click @visual", async ({ page, q, visual }) => {
    await page.setViewportSize({ width: 480, height: 480 });
    await test.expect(q.menu()).not.toBeVisible();
    await q.button("Options").click();
    await test.expect(q.menu()).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await page.waitForTimeout(500);
    await visual();
  });
});
