import { withFramework } from "#app/test-utils/preview.ts";

type Side = "top" | "right" | "bottom" | "left";

const sides: Side[] = ["top", "right", "bottom", "left"];

withFramework(import.meta.dirname, async ({ test }) => {
  for (const side of sides) {
    test(`shows the tooltip on the ${side}`, async ({ q }) => {
      const label = `${side[0]?.toUpperCase()}${side.slice(1)}`;
      const button = q.button(label);
      // Ariakit resets hover intent on scroll, so the anchor must be in view
      // before the pointer moves over it.
      await button.scrollIntoViewIfNeeded();
      await button.hover();
      const tooltip = q.tooltip(`On the ${side}`);
      await test.expect(tooltip).toBeVisible();
      await test
        .expect(async () => {
          const anchor = await button.boundingBox();
          const box = await tooltip.boundingBox();
          test.expect(anchor).not.toBeNull();
          test.expect(box).not.toBeNull();
          if (!anchor || !box) return;
          const positions: Record<Side, boolean> = {
            top: box.y + box.height <= anchor.y,
            right: box.x >= anchor.x + anchor.width,
            bottom: box.y >= anchor.y + anchor.height,
            left: box.x + box.width <= anchor.x,
          };
          test.expect(positions[side]).toBe(true);
        })
        .toPass();
    });
  }

  test("flips the tooltip when its side has no room", async ({ page, q }) => {
    // At this width, the Left button touches the left edge of the viewport.
    await page.setViewportSize({ width: 320, height: 600 });
    const button = q.button("Left");
    await button.scrollIntoViewIfNeeded();
    await button.hover();
    const tooltip = q.tooltip("On the left");
    await test.expect(tooltip).toBeVisible();
    await test
      .expect(async () => {
        const anchor = await button.boundingBox();
        const box = await tooltip.boundingBox();
        test.expect(anchor).not.toBeNull();
        test.expect(box).not.toBeNull();
        if (!anchor || !box) return;
        test.expect(box.x).toBeGreaterThanOrEqual(anchor.x + anchor.width);
      })
      .toPass();
  });
});
