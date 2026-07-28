import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("falls back from right to top and bottom", async ({ page, q }) => {
    const disclosure = q.button("Accept invite");
    const popover = q.dialog("Team meeting");
    await disclosure.click();
    await test.expect(popover).toBeVisible();

    await test.expect
      .poll(async () => {
        const anchorBox = await disclosure.boundingBox();
        const popoverBox = await popover.boundingBox();
        if (!anchorBox || !popoverBox) return -Infinity;
        return popoverBox.x - anchorBox.x - anchorBox.width + 1;
      })
      .toBeGreaterThanOrEqual(0);

    await page.setViewportSize({ width: 480, height: 1024 });
    await test.expect
      .poll(async () => {
        const anchorBox = await disclosure.boundingBox();
        const popoverBox = await popover.boundingBox();
        if (!anchorBox || !popoverBox) return -Infinity;
        return anchorBox.y - popoverBox.y - popoverBox.height;
      })
      .toBeGreaterThanOrEqual(0);

    await page.evaluate(() => window.scrollTo(0, 400));
    await test.expect
      .poll(async () => {
        const anchorBox = await disclosure.boundingBox();
        const popoverBox = await popover.boundingBox();
        if (!anchorBox || !popoverBox) return -Infinity;
        return popoverBox.y - anchorBox.y - anchorBox.height;
      })
      .toBeGreaterThanOrEqual(0);
  });
});
