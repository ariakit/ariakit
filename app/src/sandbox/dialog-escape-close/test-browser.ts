import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7726
  test("Escape closes the Combobox popover before a Dialog outside its tree when a Dialog in a shadow root has the same id", async ({
    page,
    q,
  }) => {
    await q.button("Open memo").click();
    await test.expect(q.dialog("Memo")).toBeVisible();
    // The dialog in the shadow root opens before the listbox and ignores
    // Escape, so it stays open.
    await q.button("Open shadow memo").click();
    await test.expect(q.dialog("Shadow memo")).toBeVisible();
    await q.combobox("Cheese").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Cheese")).toBeHidden();
    await test.expect(q.dialog("Memo")).toBeVisible();
    await test.expect(q.combobox("Cheese")).toBeFocused();
    // The dialog is the topmost popup in its root again, so the next Escape
    // closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Memo")).toBeHidden();
    await test.expect(q.dialog("Shadow memo")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7726
  test("Escape closes the Popover before a Dialog in a shadow root when the popover renders in the document", async ({
    page,
    q,
  }) => {
    await q.button("Open shadow order").click();
    await test.expect(q.dialog("Shadow order")).toBeVisible();
    await q.button("Crust").click();
    await test.expect(q.dialog("Crust")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Crust")).toBeHidden();
    await test.expect(q.dialog("Shadow order")).toBeVisible();
    await test.expect(q.button("Crust")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Shadow order")).toBeHidden();
  });
});
