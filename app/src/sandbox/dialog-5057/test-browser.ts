import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("data-enter is removed when dialog with render wrapper closes", async ({
    q,
  }) => {
    // When Dialog uses render={(props) => <div><div {...props} /></div>},
    // data-enter should be removed when the dialog closes, even if the
    // dialog element itself has no CSS transitions.
    // See https://github.com/ariakit/ariakit/issues/5057
    await q.button("Show modal").click();
    await test.expect(q.dialog("Success")).toBeVisible();

    await q.button("OK").click();
    await test.expect(q.dialog("Success")).not.toBeVisible();

    await test
      .expect(q.dialog("Success", { includeHidden: true }))
      .not.toHaveAttribute("data-enter");
  });

  test("data-enter is re-added when dialog with render wrapper reopens", async ({
    q,
  }) => {
    // After closing and reopening, data-enter should be re-added so
    // enter animations replay correctly.
    // See https://github.com/ariakit/ariakit/issues/5057
    await q.button("Show modal").click();
    await test.expect(q.dialog("Success")).toBeVisible();
    await q.button("OK").click();
    await test.expect(q.dialog("Success")).not.toBeVisible();

    await test
      .expect(q.dialog("Success", { includeHidden: true }))
      .not.toHaveAttribute("data-enter");

    await q.button("Show modal").click();
    const dialog = q.dialog("Success");
    await test.expect(dialog).toBeVisible();
    await test.expect(dialog).toHaveAttribute("data-enter", "true");
  });
});
