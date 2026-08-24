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
  test("automatically extends a Shift-click range", async ({ q }) => {
    await q.combobox("Favorite food").click();
    await q.option("Candy").click();
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
  });
});
