import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("opens at the context point and Escape dismisses", async ({
    page,
    q,
  }) => {
    const target = q.text("Right click here");
    await target.click({ button: "right" });
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();
    await target.click({ button: "right" });
    await test.expect(q.menu()).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.menu()).not.toBeVisible();
  });

  test("outside click dismisses", async ({ page, q }) => {
    await q.text("Right click here").click({ button: "right" });
    await test.expect(q.menu()).toBeVisible();
    await page.mouse.click(4, 4);
    await test.expect(q.menu()).not.toBeVisible();
  });

  test("keyboard traversal skips disabled items", async ({ page, q }) => {
    await q.text("Right click here").click({ button: "right" });
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Back")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Reload")).toBeFocused();
    await page.keyboard.press("Home");
    await test.expect(q.menuitem("Back")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(q.menuitem("Inspect")).toBeFocused();
  });
});
