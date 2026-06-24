import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6295
withFramework(import.meta.dirname, async ({ test }) => {
  test("returns controlled item metadata from collection.item()", async ({
    q,
  }) => {
    await q.button("Apple").click();
    await test.expect(q.status("Details")).toHaveText("Apple");

    await q.button("Rename Apple").click();
    await q.button("Green Apple").click();
    await test.expect(q.status("Details")).toHaveText("Green Apple");
  });
});
