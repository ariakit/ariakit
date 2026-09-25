import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7632
  test("Escape closes only the Combobox popover in a Dialog", async ({
    page,
    q,
  }) => {
    await q.button("Open order").click();
    await test.expect(q.dialog("Order")).toBeVisible();
    await q.combobox("Topping").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Topping")).toBeHidden();
    await test.expect(q.dialog("Order")).toBeVisible();
    await test.expect(q.combobox("Topping")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Order")).toBeHidden();
    await test.expect(q.button("Open order")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7632
  test("Escape closes only the Combobox popover in a Popover", async ({
    page,
    q,
  }) => {
    await q.button("Filters").click();
    await test.expect(q.dialog("Filters")).toBeVisible();
    await q.combobox("Fruit").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Fruit")).toBeHidden();
    await test.expect(q.dialog("Filters")).toBeVisible();
    await test.expect(q.combobox("Fruit")).toBeFocused();
    // The popover is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Filters")).toBeHidden();
    await test.expect(q.button("Filters")).toBeFocused();
  });
});
