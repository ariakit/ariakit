import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7012
  test("hovering a partially visible submenu button does not scroll", async ({
    page,
    q,
  }) => {
    const actions = q.button("Actions");
    await actions.scrollIntoViewIfNeeded();
    await actions.click();

    const menu = q.menu("Actions");
    const menuBox = await menu.boundingBox();
    if (!menuBox) {
      throw new Error("Actions menu is not visible");
    }
    await page.mouse.move(
      menuBox.x + menuBox.width / 2,
      menuBox.y + menuBox.height / 2,
    );
    await page.mouse.wheel(0, 128);
    await test.expect
      .poll(() => menu.evaluate((element) => element.scrollTop))
      .toBe(128);

    const share = q.menuitem("Share");
    const shareBox = await share.boundingBox();
    if (!shareBox) {
      throw new Error("Share menu item is not visible");
    }
    const menuBottom = menuBox.y + menuBox.height;
    test.expect(shareBox.y).toBeLessThan(menuBottom);
    test.expect(shareBox.y + shareBox.height).toBeGreaterThan(menuBottom);
    await page.mouse.move(shareBox.x + shareBox.width / 2, menuBottom - 8);

    await test.expect(share).toBeFocused();
    await test.expect
      .poll(() => menu.evaluate((element) => element.scrollTop))
      .toBe(128);
  });
});
