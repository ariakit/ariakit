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
});
