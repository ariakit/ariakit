// See https://github.com/ariakit/ariakit/issues/6310
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("reopened portaled popover focuses the first focusable element when a hidden element comes first", async ({
    q,
  }) => {
    // First open: focus correctly lands on the visible button, skipping the
    // hidden file input that comes before it in the DOM.
    await q.button("Attachments").click();
    await test.expect(q.dialog("Attachments")).toBeVisible();
    await test.expect(q.button("Choose file")).toBeFocused();

    // Closing via the disclosure moves focus out of the portal, which disables
    // focus inside it and leaves "Choose file" with tabindex="-1". The slow
    // click reproduces a real click's gap between mousedown (focus leaves the
    // portal) and mouseup (the popover closes), so the disable runs while the
    // popover is still visible, like the manual reproduction.
    await q.button("Attachments").click({ delay: 200 });
    await test.expect(q.dialog("Attachments")).not.toBeVisible();
    await test.expect(q.button("Attachments")).toBeFocused();
    // Guard the bug precondition: the reopen only exercises the broken fallback
    // when no element inside is tabbable, so confirm the disable actually ran.
    await test
      .expect(q.button("Choose file", { includeHidden: true }))
      .toHaveAttribute("tabindex", "-1");

    // Reopening must move focus to the visible button again, exactly like the
    // first open did. Before the fix, focus stayed on the disclosure because the
    // focusable fallback resolved to the hidden file input.
    await q.button("Attachments").click();
    await test.expect(q.dialog("Attachments")).toBeVisible();
    await test.expect(q.button("Choose file")).toBeFocused();
  });
});
