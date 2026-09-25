import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("Escape from tooltip content keeps the tooltip closed", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Tooltip anchor");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    const tooltip = q.tooltip("Tooltip content");
    await test.expect(tooltip).toBeVisible();
    await tooltip.click();

    await page.keyboard.press("Escape");
    await test.expect(tooltip).toBeHidden();
    await test.expect(anchor).toBeFocused();
    await test.expect(anchor).toHaveAttribute("data-focus-visible");
    // Focusable applies focus-visible to the anchor on the frame after focus
    // returns to it, which is where the tooltip could open again.
    await flushFrames(page, 2);
    await test.expect(tooltip).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7622
  test("Escape keeps the tooltip closed when the anchor has pointer focus", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Tooltip anchor");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    const tooltip = q.tooltip("Tooltip content");
    await test.expect(tooltip).toBeVisible();
    await anchor.click();
    await test.expect(anchor).toBeFocused();
    await test.expect(anchor).not.toHaveAttribute("data-focus-visible");
    await test.expect(tooltip).toBeVisible();

    // The key press makes the anchor focus-visible, which shows the tooltip in
    // other cases.
    await page.keyboard.press("Escape");
    await test.expect(tooltip).toBeHidden();
    await test.expect(anchor).toHaveAttribute("data-focus-visible");
    // Focusable applies focus-visible on the frame after the key press, where
    // the tooltip could open again.
    await flushFrames(page, 2);
    await test.expect(tooltip).toBeHidden();
  });
});
