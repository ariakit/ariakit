import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("pressing escape closes the popover", async ({ page, q }) => {
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.combobox()).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toBeHidden();
  });
});
