import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("resets outside-interaction focus tracking when reopened", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Move focus inside the dialog at least once. focus() rather than click()
    // because the unstyled modal backdrop overlays the dialog content and would
    // intercept pointer events; only the focus matters here.
    await q.button("Focus inside").focus();
    await test.expect(q.button("Focus inside")).toBeFocused();

    // Close via Escape (hideOnEscape) for the same backdrop-overlay reason.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Dialog")).not.toBeVisible();

    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // The regression only surfaces with a focusable element that did not exist
    // when the dialog opened: pre-existing outside controls are marked as
    // "outside" on open, so focusing one wouldn't exercise the reopen reset.
    // Create a brand-new outside input via the DOM (as the happy-dom test does)
    // and focus it — the page.evaluate is only setup; the user-facing assertion
    // is the dialog hiding below. Reopening must reset the dialog's outside-focus
    // tracking so this dynamic element counts as interacting outside; before the
    // fix the stale tracking kept it open.
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.setAttribute("aria-label", "Dynamic outside input");
      document.body.append(input);
      input.focus();
    });

    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });
});
