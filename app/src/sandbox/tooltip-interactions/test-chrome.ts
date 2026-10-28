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

  test("stays open when the anchor takes keyboard focus while the tooltip waits to hide", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Delayed hide anchor");
    // Focus starts on the element before the anchor, so a Tab moves focus to
    // the anchor without first hiding the tooltip on focus outside it.
    await q.button("After tooltip").focus();
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    const tooltip = q.tooltip("Delayed hide content");
    await test.expect(tooltip).toBeVisible();
    // Leaving the anchor away from the tooltip schedules the hide after the 1s
    // hide timeout.
    const box = await anchor.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 100);
    await page.keyboard.press("Tab");
    await test.expect(anchor).toBeFocused();
    await test.expect(anchor).toHaveAttribute("data-focus-visible");
    await test.expect(tooltip).toBeVisible();
    // Nothing shows the pending hide, so cross the rest of the hide timeout.
    await page.waitForTimeout(1000);
    await test.expect(tooltip).toBeVisible();
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
