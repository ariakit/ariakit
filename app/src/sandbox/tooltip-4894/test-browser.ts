import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // See https://github.com/ariakit/ariakit/issues/4894
  test("does not hide multiple controlled open tooltips", async ({ q }) => {
    await test.expect(q.tooltip("HELLO!")).toBeVisible();
    await test.expect(q.tooltip("HELLO 222!")).toBeVisible();
    await test.expect(q.text("Close requests: 0")).toBeVisible();
  });
});
