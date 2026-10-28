import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6350
  test("canceling a queued callback keeps it from running on the next event", async ({
    q,
  }) => {
    await q.button("Show shortcuts").click();
    const hint = q.region("Keyboard shortcuts");
    await test.expect(hint).toBeVisible();

    await hint.hover();
    await test.expect(q.text("Status: pinned")).toBeVisible();

    await q.button("New document").click();
    await test.expect(q.region("Keyboard shortcuts")).toBeVisible();
    await test.expect(q.text("Status: pinned")).toBeVisible();
  });
});
