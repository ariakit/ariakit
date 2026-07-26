import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/5047
  test("combobox keeps focus when selected item reappears after filtering", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await test.expect(q.combobox("Search fruits")).toBeFocused();
    // Type a query that filters out the selected item ("Apple"), then bring it
    // back by deleting a character. The selected item gets reappended to the
    // DOM, which should not steal focus from the combobox input. On iOS Safari,
    // element.focus() dismisses the keyboard.
    await page.keyboard.type("appc");
    await test.expect(q.option("Apple")).toBeHidden();
    await page.keyboard.press("Backspace");
    await test.expect(q.option("Apple")).toBeVisible();
    await test.expect(q.option("Apple")).not.toBeFocused();
    await test.expect(q.combobox("Search fruits")).toBeFocused();
    await test
      .expect(q.option("Apple"))
      .toHaveAttribute("aria-selected", "true");
  });
});
