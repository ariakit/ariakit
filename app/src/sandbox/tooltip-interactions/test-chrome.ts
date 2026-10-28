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

  test("stays open when keyboard focus reopens it while a hide is pending", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Delayed hide anchor");
    // Focus starts on the element before the anchor, so one Tab moves focus to
    // the anchor.
    await q.button("After tooltip").focus();
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    const tooltip = q.tooltip("Delayed hide content", { includeHidden: true });
    await test.expect(tooltip).toHaveAttribute("data-open");
    // Leaving the anchor away from the tooltip hides it after the 1s hide
    // timeout. Its exit transition keeps it mounted.
    const box = await anchor.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    const x = box.x + box.width / 2;
    const y = box.y + box.height + 100;
    await page.mouse.move(x, y);
    await test.expect(tooltip).not.toHaveAttribute("data-open");
    await test.expect(tooltip).toHaveAttribute("data-leave");
    // The pointer moves again outside, which schedules another hide.
    await page.mouse.move(x, y + 20);
    await page.keyboard.press("Tab");
    await test.expect(anchor).toBeFocused();
    await test.expect(tooltip).toHaveAttribute("data-open");
    // Nothing shows the pending hide, so cross its 1s hide timeout.
    await page.waitForTimeout(1000);
    await test.expect(tooltip).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8086
  test("hide the tooltip after hovering the anchor's label", async ({ q }) => {
    const anchor = q.textbox("Username");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    const tooltip = q.tooltip("Your public name");
    await test.expect(tooltip).toBeVisible();
    // The input matches :hover while its label is hovered, but the pointer left
    // the input, so the tooltip hides.
    await q.text("Username").hover();
    await test.expect(tooltip).toBeHidden();
  });
});
