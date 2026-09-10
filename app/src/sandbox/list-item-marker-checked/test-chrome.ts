import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781710
  test("uses progress as the default check state and preserves explicit values", async ({
    q,
  }) => {
    const completed = query(q.list("Completed progress"));
    const unchecked = query(q.list("Explicit unchecked state"));
    const checked = query(q.list("Explicit checked state"));
    await test.expect(completed.img("Checked")).toBeVisible();
    await test.expect(unchecked.img("Unchecked")).toBeVisible();
    await test.expect(checked.img("Checked")).toBeVisible();
  });
});
