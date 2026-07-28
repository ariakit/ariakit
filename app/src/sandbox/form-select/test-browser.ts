import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows and hides the select with pointer input", async ({ page, q }) => {
    const select = q.combobox("Favorite fruit");

    await select.click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeFocused();

    await page.mouse.click(10, 10);
    await test.expect(q.listbox()).not.toBeVisible();
    await test.expect(select).not.toBeFocused();

    await select.click({ delay: 20 });
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeFocused();
  });
});
