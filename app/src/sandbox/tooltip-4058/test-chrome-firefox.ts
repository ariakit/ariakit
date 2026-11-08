import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

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

  // https://github.com/ariakit/ariakit/issues/4058
  test("hides a hovercard when its anchor scrolls out of the panel", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves to it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(q.dialog("Ariakit")).toBeVisible();

    await page.mouse.wheel(0, 400);
    await test.expect(anchor).not.toBeInViewport();
    await test.expect(q.dialog("Ariakit")).toBeHidden();
  });

  test("keep a tooltip open when its anchor leaves the DOM", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Dismiss");
    // The accessible role query stops matching this tooltip once its anchor
    // leaves the DOM.
    const tooltip = page.locator("[role=tooltip]", {
      hasText: "Dismiss this notification",
    });
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    // The tooltip stays open until the pointer moves away.
    await anchor.click();
    await test.expect(q.text("Notification dismissed")).toBeVisible();
    await test.expect(tooltip).toHaveAttribute("data-open");
    // A page scroll runs a position update, where the removed anchor has an
    // empty rect.
    await page.evaluate(() => window.scrollBy(0, 10));
    // The scroll event and its position update run in the next frame, and a
    // close would render in the frame after it.
    await flushFrames(page);
    await test.expect(tooltip).toHaveAttribute("data-open");
  });
});
