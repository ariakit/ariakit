import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // In Safari, the click and Shift+Tab route below doesn't move focus to the
  // Bold anchor, so this keyboard test only runs in Chrome.
  // https://github.com/ariakit/ariakit/issues/8093
  test("unmarks a leaving tooltip that reopens on keyboard focus", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const bold = q.button("Bold");
    const boldTooltip = q.tooltip("Bold tooltip");

    await bold.scrollIntoViewIfNeeded();
    await bold.hover();
    await test.expect(boldTooltip).toHaveCSS("opacity", "1");

    // Bold starts its normal 2s exit transition in the gap, and Italic replaces
    // it. Bold stays mounted until that exit transition would have ended.
    const box = await bold.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
    await test.expect(boldTooltip).toHaveAttribute("data-leave");
    await q.button("Italic").click();
    await test
      .expect(q.tooltip("Italic tooltip"))
      .toHaveAttribute("data-instant");
    await test.expect(boldTooltip).toHaveAttribute("data-instant");

    // Moving focus away from Italic's anchor leaves no tooltip active, so Bold
    // reopens on focus while it's still mounted.
    await test.expect(boldTooltip).toHaveAttribute("data-leave");
    await page.keyboard.press("Shift+Tab");
    await test.expect(bold).toBeFocused();
    await test.expect(boldTooltip).toHaveAttribute("data-open");
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");
  });
});
