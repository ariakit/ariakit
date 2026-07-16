import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/2699
  test("matches custom item content and skips empty text while open", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await test.expect(q.option("Brazil")).toHaveAttribute("data-active-item");

    await page.keyboard.press("c");

    await test
      .expect(q.option("Citrus"))
      .not.toHaveAttribute("data-active-item");
    await test.expect(q.option("Canada")).toHaveAttribute("data-active-item");
  });

  test("matches custom item content while closed", async ({ page, q }) => {
    await page.keyboard.press("Tab");

    await page.keyboard.press("c");

    await test.expect(q.combobox(/^Country$/)).toContainText("Canada");
    await test.expect(q.listbox()).not.toBeAttached();
  });

  test("updates custom item text", async ({ page, q }) => {
    await q.button("Use country aliases").click();
    await q.combobox(/^Country$/).click();

    await page.keyboard.press("d");

    await test.expect(q.option("Canada")).toHaveAttribute("data-active-item");
  });

  test("matches custom content on an offscreen item", async ({ page, q }) => {
    await q.combobox(/^Virtualized country$/).click();
    await test.expect(q.option("Canada")).toHaveAttribute("data-offscreen");

    await page.keyboard.press("c");

    await test.expect(q.option("Canada")).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/6733
  test("typeahead updates the value for late unmounted items", async ({
    q,
  }) => {
    await q.button("Load fruit options").click();

    const select = q.combobox("Fruit");
    await test.expect(select).toBeFocused();
    await test.expect(q.option("Apple")).toHaveCount(0);
    await test.expect(q.status("Fruit active item")).toHaveText("orange");
    await test.expect(select).toHaveText("Orange");

    await select.press("a");

    await test.expect(q.status("Fruit active item")).toHaveText("apple");
    await test.expect(select).toHaveText("Apple");
  });

  // https://github.com/ariakit/ariakit/issues/6733
  test("typeahead updates the value for late SelectRenderer items", async ({
    q,
  }) => {
    await q.button("Load rendered fruit options").click();

    const select = q.combobox("Rendered fruit");
    await test.expect(select).toBeFocused();
    await test.expect(q.option("Apple")).toHaveCount(0);
    await test
      .expect(q.status("Rendered fruit active item"))
      .toHaveText("orange");
    await test.expect(select).toHaveText("Orange");

    await select.press("a");

    await test
      .expect(q.status("Rendered fruit active item"))
      .toHaveText("apple");
    await test.expect(select).toHaveText("Apple");
  });
});
