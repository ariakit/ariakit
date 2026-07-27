import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("focus trap elements participate in tab order", async ({ page, q }) => {
    const group = query(q.group("trap"));
    await group.text("Start").focus();
    await page.keyboard.press("Tab");
    await test.expect(group.text("Before")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(group.text("Trap")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(group.text("After")).toBeFocused();
  });

  test("focus trap elements can redirect focus", async ({ page, q }) => {
    const group = query(q.group("redirect"));
    await group.text("Start").focus();
    await page.keyboard.press("Tab");
    await test.expect(group.text("Before")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(group.text("Focus target")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(group.text("Skip")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(group.text("Focus target")).toBeFocused();
  });
});
