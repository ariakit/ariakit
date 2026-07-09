import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6295
withFramework(import.meta.dirname, async ({ test }) => {
  test("item() returns the metadata listed in the items state", async ({
    q,
  }) => {
    await q.button("Apple").click();
    await test.expect(q.status()).toHaveText("Apple");
  });

  test("item() reflects controlled items updates", async ({ q }) => {
    await q.button("Rename Apple").click();
    await q.button("Green Apple").click();
    await test.expect(q.status()).toHaveText("Green Apple");
  });

  test("item() finds items added to the items state without rendering", async ({
    q,
  }) => {
    await q.button("Add Kiwi").click();
    await test.expect(q.button("Kiwi")).not.toBeAttached();
    await q.button("Show Kiwi details").click();
    await test.expect(q.status()).toHaveText("Kiwi");
  });
});
