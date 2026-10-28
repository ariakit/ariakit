import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("auto-selects the first filtered option and restores it on reopen", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Searchable favorite fruit");
    const search = q.combobox("Search fruits");
    await select.click();
    await page.keyboard.type("c");
    await test.expect(q.option("Cake")).toHaveAttribute("data-active-item");
    await page.keyboard.type("h");
    await test.expect(q.option("Cherry")).toHaveAttribute("data-active-item");
    await page.keyboard.type("o");
    await test
      .expect(q.option("Chocolate"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");

    await select.click();
    await test
      .expect(q.option("Chocolate"))
      .toHaveAttribute("data-active-item");
    await search.fill("a");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.type("s");
    await test.expect(q.option("Pasta")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Backspace");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
  });
});
