// See https://github.com/ariakit/ariakit/issues/6339
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("backdrop fades out on close when only the backdrop is animated", async ({
    q,
  }) => {
    await q.button("Show dialog").click();
    const backdrop = q.presentation();
    await test.expect(backdrop).toHaveAttribute("data-enter", "true");
    await test.expect(q.button("Close")).toBeFocused();
    await q.button("Close").click();
    // Focus returns to the disclosure as soon as the dialog closes, so a
    // failure below unambiguously points at the backdrop leave transition.
    await test.expect(q.button("Show dialog")).toBeFocused();
    // On close, the backdrop must receive data-leave and remain visible while
    // its 500ms exit transition runs. Before the fix, the dialog hides
    // instantly and data-leave is never applied.
    await test.expect(backdrop).toHaveAttribute("data-leave", "true");
    await test.expect(backdrop).toBeVisible();
    // After the transition ends, the backdrop hides.
    await test.expect(backdrop).toBeHidden();
  });
});
