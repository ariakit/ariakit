import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6868
  test("tabs to a non-scrollable list and moves focus with ArrowDown", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    const input = q.combobox("Search fruits");
    const list = q.listbox("Favorite fruit");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.button("Review options")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(list).toBeFocused();
    await test
      .expect(q.status("Composite base element"))
      .toHaveText("combobox");

    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toBeFocused();
  });
});
