import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("copies the source and places the tooltip to the left", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = q.button("Copy commands");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await copy.scrollIntoViewIfNeeded();
    await copy.hover();
    const tooltip = q.tooltip("Copy commands");
    await test.expect(tooltip).toBeVisible();
    const tooltipBox = await tooltip.boundingBox();
    const copyBox = await copy.boundingBox();
    // A tooltip above the button is wider than it, so only its end edge tells
    // the two placements apart.
    test
      .expect(tooltipBox && copyBox && tooltipBox.x + tooltipBox.width)
      .toBeLessThanOrEqual(copyBox?.x ?? 0);
    await copy.click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe("pnpm add @ariakit/react\npnpm dev");
  });
});
