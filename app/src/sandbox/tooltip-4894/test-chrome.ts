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

  test("hides controlled tooltips that accept setOpen updates", async ({
    q,
  }) => {
    await q.button("Open managed one").click();
    await test.expect(q.tooltip("MANAGED ONE")).toBeVisible();
    await test.expect(q.tooltip("MANAGED TWO")).not.toBeVisible();

    await q.button("Open managed two").click();
    await test.expect(q.tooltip("MANAGED ONE")).not.toBeVisible();
    await test.expect(q.tooltip("MANAGED TWO")).toBeVisible();
  });

  test("keeps managed tooltips active after forced tooltips reopen", async ({
    q,
  }) => {
    await q.button("Show forced tooltips").click();
    await q.button("Open managed one").click();
    await test.expect(q.tooltip("MANAGED ONE")).toBeVisible();

    await q.button("Open managed two").click();
    await test.expect(q.tooltip("MANAGED ONE")).not.toBeVisible();
    await test.expect(q.tooltip("MANAGED TWO")).toBeVisible();
    await test.expect(q.tooltip("FORCED ONE")).toBeVisible();
    await test.expect(q.tooltip("FORCED TWO")).toBeVisible();
    await test.expect(q.tooltip("FORCED THREE")).toBeVisible();
  });
});
