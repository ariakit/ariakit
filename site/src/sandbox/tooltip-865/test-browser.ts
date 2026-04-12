import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("tooltip renders inside fullscreen element", async ({ page, q }) => {
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Hover me").hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    // The portal containing the tooltip must be inside the fullscreen
    // element. Otherwise, the tooltip is invisible to the user.
    const isInsideFullscreen = await page.evaluate(() => {
      const fullscreenEl = document.fullscreenElement;
      const tooltipEl = document.querySelector("[role=tooltip]");
      if (!fullscreenEl || !tooltipEl) return false;
      return fullscreenEl.contains(tooltipEl);
    });
    test.expect(isInsideFullscreen).toBe(true);
  });
});
