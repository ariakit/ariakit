import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7094
  test("Option+Tab focuses the anchor as keyboard navigation", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Bookmark");

    // Safari moves focus with Option+Tab instead of Tab when the macOS keyboard
    // navigation setting is off. Clicking first is what makes the regression
    // observable: modality starts as keyboard until a pointer gesture drops it.
    await q
      .text("Click here, then press Option+Tab to focus the button.")
      .click();
    await page.keyboard.press("Alt+Tab");

    await test.expect(anchor).toBeFocused();
    await test.expect(anchor).toHaveAttribute("data-focus-visible", "true");
    await test.expect(q.tooltip("Add to bookmarks")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7094
  test("clicking the anchor is still pointer navigation", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Bookmark");

    await anchor.click();
    await test.expect(anchor).toBeFocused();
    // Focus visibility is applied from a queueBeforeEvent callback that falls
    // back to requestAnimationFrame, so the attribute would also be absent
    // while it is still pending. Cross those frames to prove it never arrives.
    await flushFrames(page);
    await test.expect(anchor).not.toHaveAttribute("data-focus-visible");
  });
});
