import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6331
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps parent stores in sync when a parent clamps the child value", async ({
    q,
  }) => {
    await q.button("Add 3").click();
    await test.expect(q.status("Selected")).toHaveText("3");
    await test.expect(q.status("Cart")).toHaveText("3");
    await test.expect(q.status("Order summary")).toHaveText("3");

    await q.button("Add 3").click();
    await test.expect(q.status("Selected")).toHaveText("5");
    await test.expect(q.status("Cart")).toHaveText("5");
    await test.expect(q.status("Order summary")).toHaveText("5");
  });
});
