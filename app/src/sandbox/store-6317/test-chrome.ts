import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6317
withFramework(import.meta.dirname, async ({ test }) => {
  test("notifies an all-keys listener subscribed during a keyed dispatch", async ({
    q,
  }) => {
    await test.expect(q.text("No activity yet")).toBeVisible();

    await q.button("Like (0)").click();

    await test.expect(q.button("Like (1)")).toBeVisible();
    await test.expect(q.text("0 -> 1")).toBeVisible();
  });
});
