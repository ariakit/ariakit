import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("autocompletes with vertical arrow keys", async ({ page, q }) => {
    const combobox = q.combobox("Your favorite fruit");
    await combobox.focus();
    await page.keyboard.type("a");
    await test.expect(q.listbox()).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await test.expect(combobox).toHaveValue("Apple");

    await page.reload();
    const reloadedCombobox = q.combobox("Your favorite fruit");
    await reloadedCombobox.focus();
    await page.keyboard.type("w");
    await page.keyboard.press("ArrowUp");
    await test.expect(reloadedCombobox).toHaveValue("Watermelon");
  });

  test("commits the inline autocomplete when the input is clicked", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Your favorite fruit");
    await combobox.focus();
    await page.keyboard.type("w");
    await page.keyboard.press("ArrowUp");
    await combobox.click();
    await test.expect(combobox).toHaveValue("Watermelon");
  });
});
