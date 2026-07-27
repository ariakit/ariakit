import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-multiple/test.ts
  test("keeps the list open while toggling multiple values", async ({ q }) => {
    const select = q.combobox("Favorite food");
    await test.expect(select).toHaveText("2 food selected");

    await select.click();
    await q.option("Chocolate").click();
    await test
      .expect(q.option("Chocolate"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("3 food selected");

    await q.option("Chocolate").click();
    await test
      .expect(q.option("Chocolate"))
      .toHaveAttribute("aria-selected", "false");
    await test.expect(select).toHaveText("2 food selected");
  });
});
