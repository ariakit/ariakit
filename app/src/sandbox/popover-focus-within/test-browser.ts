import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("tracks focus within the popover trigger group", async ({ page, q }) => {
    const group = q.group();
    await test.expect(group).not.toHaveClass(/focus-within/);

    await page.keyboard.press("Tab");
    await test.expect(group).toHaveClass(/focus-within/);
    await page.keyboard.press("Tab");
    await test.expect(group).not.toHaveClass(/focus-within/);
    await page.keyboard.press("Shift+Tab");
    await test.expect(group).toHaveClass(/focus-within/);

    await page.keyboard.press("Enter");
    await test.expect(q.button("Accept")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("External button")).toBeFocused();
    await test.expect(group).not.toHaveClass(/focus-within/);
  });
});
