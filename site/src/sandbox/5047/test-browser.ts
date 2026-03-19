import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("combobox keeps focus when selected item reappears after filtering", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await test.expect(q.combobox("Search...")).toBeFocused();
    // Type a query that filters out the selected item ("Apple"), then bring it
    // back by deleting a character. The selected item gets reappended to the
    // DOM, which should not steal focus from the combobox input (especially on
    // iOS Safari where element.focus() dismisses the keyboard).
    // See https://github.com/ariakit/ariakit/issues/5047
    await page.keyboard.type("appc");
    await test.expect(q.option("Apple")).toBeHidden();
    await page.keyboard.press("Backspace");
    await test.expect(q.option("Apple")).toBeVisible();
    await test.expect(q.combobox("Search...")).toBeFocused();
  });

  test("selected item is focused when reopening popover", async ({
    page,
    q,
  }) => {
    // Select "Orange" via the combobox
    await q.combobox("Favorite fruit").click();
    await page.keyboard.type("or");
    await test.expect(q.option("Orange")).toBeVisible();
    await q.option("Orange").click();
    await test.expect(q.combobox("Favorite fruit")).toContainText("Orange");
    // Reopen the popover - the selected item should be auto-focused
    await q.combobox("Favorite fruit").click();
    await test.expect(q.option("Orange")).toHaveAttribute("data-active-item");
  });
});
