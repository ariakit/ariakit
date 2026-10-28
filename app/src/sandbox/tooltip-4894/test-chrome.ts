import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // See https://github.com/ariakit/ariakit/issues/4894
  test("does not loop when multiple tooltips are forced open", async ({
    q,
  }) => {
    await q.button("Show forced tooltips").click();
    await test.expect(q.tooltip("FORCED ONE")).toBeVisible();
    await test.expect(q.tooltip("FORCED TWO")).toBeVisible();
    await test.expect(q.tooltip("FORCED THREE")).toBeVisible();
    await test.expect(q.text(/Forced close requests: [1-9]\d*/)).toBeVisible();
  });
});
