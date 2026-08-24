import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("automatically recomputes a Shift keyboard range", async ({ q }) => {
    const select = q.combobox("Favorite food");
    await select.click();
    await select.press("ArrowDown");
    await test.expect(q.option("Candy")).toHaveAttribute("data-active-item");

    await select.press("Shift+ArrowDown");
    await test
      .expect(q.status("Automatic selection"))
      .toHaveText("4 selected: Apple, Cake, Candy, Carrot");
    await test.expect(q.option("Carrot")).toHaveAttribute("data-active-item");

    await select.press("Shift+ArrowUp");
    await test.expect(q.option("Candy")).toHaveAttribute("data-active-item");
    await test
      .expect(q.status("Automatic selection"))
      .toHaveText("3 selected: Apple, Cake, Candy");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("automatically extends a Shift-click range without selecting text", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite food").click();
    await q.option("Candy").click();
    // Headless engines do not consistently reproduce OS drag selection, so
    // seed the real DOM Selection that the pointer Shift cleanup must clear.
    await q.heading("Select with ranges", { level: 1 }).evaluate((element) => {
      const selection = element.ownerDocument.getSelection();
      const range = element.ownerDocument.createRange();
      range.selectNodeContents(element);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
    await test.expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ""))
      .not.toBe("");
    await q.option("Chocolate").click({ modifiers: ["Shift"] });

    await test
      .expect(q.status("Automatic selection"))
      .toHaveText("6 selected: Apple, Cake, Candy, Carrot, Cherry, Chocolate");
    await test
      .expect(q.option("Carrot"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Cherry"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ""))
      .toBe("");
  });
});
