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

  test("tooltip moves back to body after exiting fullscreen", async ({
    page,
    q,
  }) => {
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Hover me").hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    await q.button("Exit fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    await q.button("Hover me").hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    // The portal node must be a direct child of document.body, not still
    // inside the former fullscreen container.
    const portalParentIsBody = await page.evaluate(() => {
      const tooltipEl = document.querySelector("[role=tooltip]");
      const portalNode = tooltipEl?.closest("[id^='portal/']");
      if (!portalNode) return false;
      return portalNode.parentElement === document.body;
    });
    test.expect(portalParentIsBody).toBe(true);
  });

  test("tooltip mounted while in fullscreen renders inside it", async ({
    page,
    q,
  }) => {
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    // Mount the second tooltip while already in fullscreen.
    await q.button("Show second tooltip").click();
    await q.button("Second anchor").hover();
    await test.expect(q.tooltip("Second tooltip")).toBeVisible();
    const isInsideFullscreen = await page.evaluate(() => {
      const fullscreenEl = document.fullscreenElement;
      const tooltipEl = document.querySelectorAll("[role=tooltip]")[1];
      if (!fullscreenEl || !tooltipEl) return false;
      return fullscreenEl.contains(tooltipEl);
    });
    test.expect(isInsideFullscreen).toBe(true);
  });
});
