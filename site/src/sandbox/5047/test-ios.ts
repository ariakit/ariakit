import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("combobox keeps focus when selected item reappears after filtering", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").tap();
    await test.expect(q.combobox("Search")).toBeFocused();
    // Type a query that filters out the selected item ("Apple"), then bring it
    // back by deleting a character. The selected item gets reappended to the
    // DOM, which should not steal focus from the combobox input. On iOS Safari,
    // element.focus() dismisses the keyboard.
    // See https://github.com/ariakit/ariakit/issues/5047
    await page.keyboard.type("appc");
    await test.expect(q.option("Apple")).toBeHidden();
    await page.keyboard.press("Backspace");
    await test.expect(q.option("Apple")).toBeVisible();
    await test.expect(q.combobox("Search")).toBeFocused();
  });
});
