import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names the icon button on hover and hides when the pointer leaves", async ({
    page,
    q,
  }) => {
    const button = q.button("Notifications");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await button.scrollIntoViewIfNeeded();
    await button.hover();
    await test.expect(q.tooltip("Notifications")).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(q.tooltip("Notifications")).toBeHidden();
  });

  test("keeps the tooltip open while the pointer moves over it", async ({
    page,
    q,
  }) => {
    const button = q.button("Notifications");
    await button.scrollIntoViewIfNeeded();
    await button.hover();
    const tooltip = q.tooltip("Notifications");
    await test.expect(tooltip).toBeVisible();
    const box = await tooltip.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    // Cross the gap between the button and the tooltip in steps, as a pointer
    // does.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 12,
    });
    // Ariakit hides a tooltip in a 0ms timer after a move outside of it. A
    // closing tooltip then stays displayed for its 250ms exit transition and
    // for its 250ms display transition after Ariakit hides it. The wait crosses
    // the frames of the timer and both transitions.
    await flushFrames(page);
    await page.waitForTimeout(500);
    // A retrying assertion would also pass if the tooltip hid and showed again.
    test.expect(await tooltip.isVisible()).toBe(true);
  });

  test("shows the tooltip on keyboard focus and hides it on Escape", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    const button = q.button("Notifications");
    await test.expect(button).toBeFocused();
    await test.expect(q.tooltip("Notifications")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Notifications")).toBeHidden();
    await test.expect(button).toBeFocused();
  });
});
