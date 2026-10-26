import { withFramework } from "#app/test-utils/preview.ts";

const midwayToShowTimeout = 250;

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows another tooltip immediately while one is active", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);

    await q.button("First anchor").hover();
    await test.expect(q.tooltip("First tooltip")).toBeVisible();

    await q.button("Second anchor").hover();
    await test
      .expect(q.tooltip("Second tooltip"))
      .toBeVisible({ timeout: midwayToShowTimeout });
    await test.expect(q.tooltip("First tooltip")).not.toBeVisible();

    await page.mouse.move(0, 0);
    await test.expect(q.tooltip("Second tooltip")).not.toBeVisible();

    // This must be greater than skipTimeout and less than showTimeout.
    await page.waitForTimeout(midwayToShowTimeout);
    await q.button("First anchor").hover();
    await page.waitForTimeout(midwayToShowTimeout);
    await test.expect(q.tooltip("First tooltip")).not.toBeVisible();
    await test.expect(q.tooltip("First tooltip")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/8089
  test("moves a shared tooltip to the next anchor while it is active", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);

    await q.button("Shared first anchor").hover();
    await test.expect(q.tooltip("Shared first tooltip")).toBeVisible();

    const secondAnchor = q.button("Shared second anchor");
    await secondAnchor.hover();
    const secondTooltip = q.tooltip("Shared second tooltip");
    await test
      .expect(secondTooltip)
      .toBeVisible({ timeout: midwayToShowTimeout });
    await test.expect
      .poll(async () => {
        const anchorBox = await secondAnchor.boundingBox();
        const tooltipBox = await secondTooltip.boundingBox();
        if (!anchorBox || !tooltipBox) return null;
        const anchorCenterX = anchorBox.x + anchorBox.width / 2;
        const tooltipCenterX = tooltipBox.x + tooltipBox.width / 2;
        return Math.abs(tooltipCenterX - anchorCenterX);
      })
      .toBeLessThan(1);
  });

  // https://github.com/ariakit/ariakit/issues/8093
  test("marks tooltips that show or hide at once because of the skip window", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const boldTooltip = q.tooltip("Bold tooltip");
    const italicTooltip = q.tooltip("Italic tooltip");

    await q.button("Bold").scrollIntoViewIfNeeded();
    await q.button("Bold").hover();
    await test.expect(boldTooltip).toBeVisible();
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");

    await q.button("Italic").hover();
    await test.expect(italicTooltip).toBeVisible();
    await test.expect(italicTooltip).toHaveAttribute("data-instant");
    // The style rule for data-instant skips the 2s exit transition of the
    // replaced tooltip, so it hides well before that transition would end.
    await test.expect(boldTooltip).toBeHidden({ timeout: 1000 });

    await page.mouse.move(0, 0);
    await test.expect(italicTooltip).toHaveAttribute("data-leave");
    // A normal hide removes the mark at once, so the exit transition runs.
    await test
      .expect(italicTooltip)
      .not.toHaveAttribute("data-instant", { timeout: 100 });
    await test.expect(italicTooltip).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/8093
  test("marks a leaving tooltip when another tooltip replaces it", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const bold = q.button("Bold");
    const boldTooltip = q.tooltip("Bold tooltip");

    await bold.scrollIntoViewIfNeeded();
    await bold.hover();
    await test.expect(boldTooltip).toHaveCSS("opacity", "1");

    // Moving through the gap between the anchors starts the normal exit
    // transition before the next tooltip shows.
    const box = await bold.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
    await test.expect(boldTooltip).toHaveAttribute("data-leave");
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");

    await q.button("Italic").hover();
    await test
      .expect(q.tooltip("Italic tooltip"))
      .toHaveAttribute("data-instant");
    await test.expect(boldTooltip).toHaveAttribute("data-instant");
    // The style rule for data-instant cancels the running 2s exit transition.
    await test.expect(boldTooltip).toHaveCSS("opacity", "0", { timeout: 600 });
  });

  // https://github.com/ariakit/ariakit/issues/8093
  // https://github.com/ariakit/ariakit/pull/8098#discussion_r4373430734
  test("marks the replaced tooltip when a leaving tooltip reopens", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const bold = q.button("Bold");
    const boldTooltip = q.tooltip("Bold tooltip");
    const italicTooltip = q.tooltip("Italic tooltip");

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
    await q.button("Italic").hover();
    await test.expect(italicTooltip).toHaveAttribute("data-instant");

    // Bold reopens at once while it's still mounted, so it replaces Italic.
    await test.expect(boldTooltip).toHaveAttribute("data-leave");
    await bold.hover();
    await test.expect(boldTooltip).toHaveAttribute("data-open");
    await test.expect(boldTooltip).toHaveAttribute("data-instant");
    // The style rule for data-instant skips the 2s exit transition of Italic.
    await test.expect(italicTooltip).toBeHidden({ timeout: 1000 });
  });

  // https://github.com/ariakit/ariakit/issues/8093
  // https://github.com/ariakit/ariakit/pull/8098#discussion_r4373450940
  test("unmarks a leaving tooltip that reopens after the normal delay", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const bold = q.button("Bold");
    const boldTooltip = q.tooltip("Bold tooltip");
    const italicTooltip = q.tooltip("Italic tooltip");

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
    await test.expect(italicTooltip).toHaveAttribute("data-instant");
    await test.expect(boldTooltip).toHaveAttribute("data-instant");

    // Italic's anchor loses focus, so no tooltip is active anymore, and Bold
    // reopens after the normal delay while it's still mounted.
    await page.mouse.click(5, 5);
    await test.expect(italicTooltip).not.toHaveAttribute("data-open");
    await test.expect(boldTooltip).toHaveAttribute("data-leave");
    await bold.hover();
    await test.expect(boldTooltip).toHaveAttribute("data-open");
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");
  });

  // https://github.com/ariakit/ariakit/issues/8093
  // https://github.com/ariakit/ariakit/pull/8098#discussion_r4373818540
  test("marks a tooltip that reopens at once on its own anchor", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const bold = q.button("Bold");
    const boldTooltip = q.tooltip("Bold tooltip");

    await bold.scrollIntoViewIfNeeded();
    await bold.hover();
    await test.expect(boldTooltip).toHaveCSS("opacity", "1");
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");

    // Bold hides on its own in the gap, so it's still the active tooltip and
    // reopens at once when the pointer returns within the skip window.
    const box = await bold.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
    await test.expect(boldTooltip).toHaveAttribute("data-leave");
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");
    await bold.hover();
    await test.expect(boldTooltip).toHaveAttribute("data-open");
    await test.expect(boldTooltip).toHaveAttribute("data-instant");
  });

  // https://github.com/ariakit/ariakit/issues/8093
  // https://github.com/ariakit/ariakit/pull/8098#discussion_r4373888333
  test("replaces the active tooltip when a leaving tooltip reopens on focus", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const bold = q.button("Bold");
    const boldTooltip = q.tooltip("Bold tooltip");
    const italicTooltip = q.tooltip("Italic tooltip");

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
    await q.button("Italic").hover();
    await test.expect(italicTooltip).toHaveAttribute("data-instant");
    // An unmounted Italic counts as hidden.
    const italicOpacity = () =>
      italicTooltip
        .evaluate(
          (element) => Number(getComputedStyle(element).opacity),
          undefined,
          { timeout: 100 },
        )
        .catch(() => 0);
    // Italic's 2s enter transition must be well underway, so a normal exit
    // transition would take a while to hide it.
    await test.expect
      .poll(italicOpacity, { intervals: [50] })
      .toBeGreaterThan(0.5);

    // Without a pointer press, focus is still visible, so focusing Bold reopens
    // its tooltip while it's still mounted, and it replaces Italic.
    await test.expect(boldTooltip).toHaveAttribute("data-leave");
    await bold.focus();
    await test.expect(boldTooltip).toHaveAttribute("data-open");
    // Focus moving to Bold can start Italic's normal exit transition first.
    // Either way, the style rule for data-instant hides Italic at once.
    await test.expect
      .poll(italicOpacity, { intervals: [50], timeout: 400 })
      .toBe(0);
    // Focus shows tooltips at once anyway, so this isn't the skip window.
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");
  });

  // https://github.com/ariakit/ariakit/issues/8093
  // https://github.com/ariakit/ariakit/pull/8098#discussion_r4373888338
  test("keeps a delayed tooltip unmarked when another tooltip shows during the delay", async ({
    page,
    q,
  }) => {
    await page.mouse.move(0, 0);
    const bold = q.button("Bold");
    const boldTooltip = q.tooltip("Bold tooltip");
    const italicTooltip = q.tooltip("Italic tooltip");

    await bold.scrollIntoViewIfNeeded();
    await bold.hover();
    // Without a pointer press, focus is still visible, so focusing Italic shows
    // its tooltip at once while Bold still waits for its show delay.
    await q.button("Italic").focus();
    await test.expect(italicTooltip).toHaveAttribute("data-open");
    await test.expect(boldTooltip).toHaveAttribute("data-open");
    await test.expect(boldTooltip).not.toHaveAttribute("data-instant");
    // Bold still replaces Italic, so the style rule for data-instant skips the
    // 2s exit transition of Italic.
    await test.expect(italicTooltip).toBeHidden({ timeout: 1000 });
  });
});
