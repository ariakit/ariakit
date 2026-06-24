import { withFramework } from "#app/test-utils/preview.ts";

// See https://github.com/ariakit/ariakit/issues/6313
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps hoisted and provider select values in sync after init", async ({
    q,
  }) => {
    await test.expect(q.combobox("Favorite fruit")).toHaveText("Banana");
    await test.expect(q.status()).toHaveText("Banana");
  });
});
