import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // See https://github.com/ariakit/ariakit/issues/4894
  test("works around the crash by opening one controlled tooltip at a time", async ({
    q,
  }) => {
    await q.button("Open first tooltip").click();
    await test.expect(q.tooltip("HELLO!")).toBeVisible();
    await test.expect(q.tooltip("HELLO 222!")).not.toBeVisible();

    await q.button("Open second tooltip").click();
    await test.expect(q.tooltip("HELLO!")).not.toBeVisible();
    await test.expect(q.tooltip("HELLO 222!")).toBeVisible();
  });
});
