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
});
