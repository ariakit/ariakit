import { withFramework } from "#app/test-utils/preview.ts";

// After a scroll, Playwright WebKit sends a mousemove whose screen position
// differs from its real moves, so the hover check already hides the tooltip
// there. Chrome and Firefox send no mousemove after a scroll.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4058
  test("hides the tooltip when its anchor scrolls out of the panel", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Bookmark");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves to it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(q.tooltip("Add to bookmarks")).toBeVisible();

    await page.mouse.wheel(0, 400);
    await test.expect(anchor).not.toBeInViewport();
    await test.expect(q.tooltip("Add to bookmarks")).toBeHidden();
  });
});
