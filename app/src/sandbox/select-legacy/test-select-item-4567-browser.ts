import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ q }) => {
    await q.button("Show select-item-4567").click();
  });

  // https://github.com/ariakit/ariakit/issues/4567
  test("exposes and updates the SelectItem selected state", async ({ q }) => {
    await q.combobox("Favorite fruits").click();
    await test.expect(q.option("Apple (selected)")).toBeVisible();
    await test.expect(q.option("Banana (not selected)")).toBeVisible();

    await q.option("Banana (not selected)").click();
    await test.expect(q.option("Banana (selected)")).toBeVisible();

    await q.option("Apple (selected)").click();
    await test.expect(q.option("Apple (not selected)")).toBeVisible();
  });
});
