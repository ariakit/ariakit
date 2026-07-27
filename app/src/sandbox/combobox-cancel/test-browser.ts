import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("clears the input with pointer and keyboard interaction", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.click();
    await q.option("Apple").click();
    await test.expect(combobox).toHaveValue("Apple");

    await q.button("Clear input").click();
    await test.expect(combobox).toHaveValue("");
    await test.expect(combobox).toBeFocused();

    await page.keyboard.type("a");
    await page.keyboard.press("Tab");
    await test.expect(q.button("Clear input")).toBeFocused();
    await page.keyboard.press("Enter");
    await test.expect(combobox).toHaveValue("");
    await test.expect(combobox).toBeFocused();
    await test.expect(q.listbox()).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/1652
  test("clears the active option when the input is cleared", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    const apple = q.option("Apple");

    await combobox.focus();
    await page.keyboard.type("a");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await test.expect(apple).not.toHaveAttribute("data-active-item");

    await page.keyboard.type("a");
    await q.button("Clear input").click();
    await test.expect(apple).not.toHaveAttribute("data-active-item");
  });
});
