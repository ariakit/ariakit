import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/6868
  test("tabs to a non-scrollable list with real focus", async ({ page, q }) => {
    await q.combobox("Real focus fruit").click();
    const input = q.combobox("Search Real focus fruit");
    const list = q.listbox("Real focus fruit");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Tab");
    await test
      .expect(q.button("Review Real focus fruit options"))
      .toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(list).toBeFocused();
    await test
      .expect(q.status("Real focus fruit base element"))
      .toHaveText("combobox");

    await page.keyboard.press("ArrowDown");
    await test.expect(query(list).option("Apple")).toBeFocused();
    await test
      .expect(q.status("Real focus fruit selected value"))
      .toHaveText("Apple");

    await list.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(query(list).option("Banana")).toBeFocused();
    await test
      .expect(q.status("Real focus fruit selected value"))
      .toHaveText("Banana");

    await list.focus();
    await page.keyboard.press("ArrowUp");
    await test.expect(query(list).option("Apple")).toBeFocused();
    await test
      .expect(q.status("Real focus fruit selected value"))
      .toHaveText("Apple");

    await list.focus();
    await page.keyboard.press("Home");
    await test.expect(query(list).option("Apple")).toBeFocused();

    await list.focus();
    await page.keyboard.press("End");
    await test.expect(query(list).option("Orange")).toBeFocused();
  });

  test("tabs to a non-scrollable list with virtual focus", async ({
    page,
    q,
  }) => {
    await q.combobox("Virtual focus fruit").click();
    const input = q.combobox("Search Virtual focus fruit");
    const list = q.listbox("Virtual focus fruit");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Tab");
    await test
      .expect(q.button("Review Virtual focus fruit options"))
      .toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(list).toBeFocused();
    await test
      .expect(q.status("Virtual focus fruit base element"))
      .toHaveText("combobox");

    await page.keyboard.press("ArrowDown");
    const orange = query(list).option("Orange");
    await test.expect(input).toBeFocused();
    await test.expect(orange).toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.status("Virtual focus fruit selected value"))
      .toHaveText("Orange");

    await list.focus();
    await page.keyboard.press("ArrowUp");
    const banana = query(list).option("Banana");
    await test.expect(input).toBeFocused();
    await test.expect(banana).toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.status("Virtual focus fruit selected value"))
      .toHaveText("Banana");
  });

  test("moves spatially from a focused RTL grid", async ({ page, q }) => {
    await q.combobox("Grid fruit").click();
    const grid = q.grid("Grid fruit");
    await q.gridcell("Top Center").focus();

    await grid.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.gridcell("Bottom Center")).toBeFocused();

    await grid.focus();
    await page.keyboard.press("ArrowUp");
    await test.expect(q.gridcell("Top Center")).toBeFocused();

    await grid.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.gridcell("Top Left")).toBeFocused();

    await q.gridcell("Top Center").focus();
    await grid.focus();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.gridcell("Top Right")).toBeFocused();
  });
});
