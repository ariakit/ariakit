import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("falls back from right to top and bottom", async ({ page, q }) => {
    const disclosure = q.button("Accept invite");
    const popover = q.dialog("Team meeting");
    await disclosure.click();
    await test.expect(popover).toBeVisible();

    let anchorBox = await disclosure.boundingBox();
    let popoverBox = await popover.boundingBox();
    test.expect(anchorBox).not.toBeNull();
    test.expect(popoverBox).not.toBeNull();
    if (!anchorBox) return;
    if (!popoverBox) return;
    test
      .expect(popoverBox.x)
      .toBeGreaterThanOrEqual(anchorBox.x + anchorBox.width - 1);

    await page.setViewportSize({ width: 480, height: 1024 });
    anchorBox = await disclosure.boundingBox();
    popoverBox = await popover.boundingBox();
    test.expect(anchorBox).not.toBeNull();
    test.expect(popoverBox).not.toBeNull();
    if (!anchorBox) return;
    if (!popoverBox) return;
    test
      .expect(popoverBox.y + popoverBox.height)
      .toBeLessThanOrEqual(anchorBox.y);

    await page.evaluate(() => window.scrollTo(0, 400));
    anchorBox = await disclosure.boundingBox();
    popoverBox = await popover.boundingBox();
    test.expect(anchorBox).not.toBeNull();
    test.expect(popoverBox).not.toBeNull();
    if (!anchorBox) return;
    if (!popoverBox) return;
    test
      .expect(popoverBox.y)
      .toBeGreaterThanOrEqual(anchorBox.y + anchorBox.height);
  });
});
