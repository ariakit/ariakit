import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/5058
  test("submits every selected value", async ({ q }) => {
    const combobox = q.combobox("Favorite fruits");
    await combobox.click();
    await q.option("Apple").click();
    await q.option("Orange").click();
    await combobox.fill("typed search");
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText('["apple","orange"]');
  });

  // https://github.com/ariakit/ariakit/issues/5058
  test("does not submit an empty search value", async ({ q }) => {
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText("[]");
  });
});
