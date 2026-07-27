import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-form/test.ts
  test("submits the selected value through the native control", async ({
    q,
  }) => {
    await q.button("Submit").click();
    await test.expect(q.status()).toHaveText("Submitted: Apple");

    await q.combobox("Favorite fruit").click();
    await q.option("Orange").click();
    await q.button("Submit").click();
    await test.expect(q.status()).toHaveText("Submitted: Orange");
  });
});
