import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6733
  test("typeahead updates the value for late unmounted items", async ({
    q,
  }) => {
    await q.button("Load fruit options").click();

    const select = q.combobox("Fruit");
    await test.expect(select).toBeFocused();
    await test.expect(q.option("Apple")).toHaveCount(0);

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

    await select.press("a");

    await test
      .expect(q.status("Rendered fruit active item"))
      .toHaveText("apple");
    await test.expect(select).toHaveText("Apple");
  });
});
