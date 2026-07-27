import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("selects and unselects multiple options", async ({ q }) => {
    await q.combobox().click();
    await test
      .expect(q.option("Bacon"))
      .toHaveAttribute("aria-selected", "true");

    await q.option("Burger").click();
    await q.option("Banana").click();
    await test
      .expect(q.option("Burger"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Banana"))
      .toHaveAttribute("aria-selected", "true");

    await q.option("Burger").click();
    await test
      .expect(q.option("Burger"))
      .toHaveAttribute("aria-selected", "false");
  });

  // https://github.com/ariakit/ariakit/issues/6848
  test("keeps keyboard navigation after clicking the listbox", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.click();
    const listbox = q.listbox();
    // Options cover the listbox's visible box, so target the listbox itself to
    // preserve the regression's event target.
    await listbox.dispatchEvent("click");
    await test.expect(combobox).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await test.expect(combobox).toBeFocused();
  });
});
