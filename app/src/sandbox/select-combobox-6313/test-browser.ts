import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6313
  test("keeps hoisted and provider select values in sync after init", async ({
    q,
  }) => {
    await test.expect(q.combobox("Favorite fruit")).toHaveText("Banana");
    await test.expect(q.status()).toHaveText("Banana");
  });
});
