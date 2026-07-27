import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select/test.ts
  test("opens on the selected item and commits another option", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await test.expect(select).toHaveText("Apple");

    await select.click();
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await test
      .expect(q.option("Apple"))
      .toHaveAttribute("aria-selected", "true");

    await q.option("Banana").click();
    await test.expect(q.listbox()).toHaveCount(0);
    await test.expect(select).toHaveText("Banana");
  });
});
