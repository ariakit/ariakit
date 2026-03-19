import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("selected item does not have data-autofocus when reappearing after filtering", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await test.expect(q.combobox("Search...")).toBeFocused();
    // Type a query that filters out the selected item ("Apple"), then bring it
    // back by deleting a character. The selected item gets reappended to the
    // DOM, which triggers autoFocus and steals focus from the combobox input on
    // iOS Safari.
    await page.keyboard.type("appc");
    await test.expect(q.option("Apple")).toBeHidden();
    await page.keyboard.press("Backspace");
    await test.expect(q.option("Apple")).toBeVisible();
    await test.expect(q.option("Apple")).not.toHaveAttribute("data-autofocus");
  });
});
