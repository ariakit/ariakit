import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("resets outside-interaction focus tracking when reopened", async ({
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Mark the dialog as interacted-with by focusing a field inside it, then
    // close and reopen it. Asserting the focus landed inside guards against the
    // test silently passing without exercising the reopen reset.
    await q.textbox("Inside field").click();
    await test.expect(q.textbox("Inside field")).toBeFocused();
    await q.button("Close dialog").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();

    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Revealing the outside field moves focus to a brand-new node outside the
    // dialog. Because reopening reset the "was focused inside" flag, this counts
    // as interacting outside and closes the dialog.
    await q.button("Reveal outside field").click();
    await test.expect(q.textbox("Dynamic outside field")).toBeFocused();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });
});
