import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("coordinates Ariakit combobox behavior with the Radix popover", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(combobox).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(q.option(/Apple/)).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect(combobox).toHaveValue("Apple");
    await test.expect(q.listbox()).toHaveCount(0);

    await combobox.click();
    await test.expect(q.listbox()).toBeVisible();
    await page.locator("body").click({ position: { x: 4, y: 4 } });
    await test.expect(q.listbox()).toHaveCount(0);
  });
});
