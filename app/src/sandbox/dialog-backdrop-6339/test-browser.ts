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

  test("backdrop finishes its longer fade out when the panel has a shorter transition", async ({
    page,
    q,
  }) => {
    await q.button("Show fast dialog").click();
    const backdrop = q.presentation();
    await test.expect(backdrop).toHaveAttribute("data-enter", "true");
    await test.expect(q.button("Close")).toBeFocused();
    await q.button("Close").click();
    // Focus returns to the disclosure as soon as the dialog closes.
    await test.expect(q.button("Show fast dialog")).toBeFocused();
    await test.expect(backdrop).toHaveAttribute("data-leave", "true");
    // Wait past the panel's 150ms transition. The backdrop must keep leaving
    // until its own 500ms transition ends. Before the fix, the panel's shorter
    // timeout stopped the shared animation state, hiding the backdrop at
    // 150ms.
    await page.waitForTimeout(250);
    await test.expect(backdrop).toHaveAttribute("data-leave", "true");
    await test.expect(backdrop).toBeVisible();
    // After the backdrop's transition ends, it hides.
    await test.expect(backdrop).toBeHidden();
  });
});
