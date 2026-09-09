import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973273374
  test("opens and selects with a supplied store", async ({ q }) => {
    const select = q.combobox("Fruit");
    await test.expect(select).toHaveText("Apple");
    await select.click();
    await test.expect(q.option("Orange")).toBeVisible();
    await q.option("Orange").click();
    await test.expect(select).toHaveText("Orange");
    await test.expect(q.text("Selected fruit: Orange")).toBeVisible();
    await test.expect(q.listbox()).toBeHidden();
  });
});
