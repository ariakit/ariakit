import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7410
  test("arrow keys open and close the menus of a vertical menubar", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.menuitem("File")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.menu("File")).toBeVisible();
    await test.expect(q.menuitem("New")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Open")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await test.expect(q.menuitem("New")).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await test.expect(q.menu("File")).not.toBeVisible();
    await test.expect(q.menuitem("File")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await test.expect(q.menu("Edit")).not.toBeVisible();

    await page.keyboard.press("ArrowUp");
    await test.expect(q.menuitem("File")).toBeFocused();
    await test.expect(q.menu("File")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7410
  test("menus open beside their vertical menubar item", async ({ page, q }) => {
    const file = q.menuitem("File");
    const menu = q.menu("File");

    await page.keyboard.press("Tab");
    await test.expect(file).toBeFocused();
    // Enter already opens the menu, so this test isolates the placement from
    // the opening key that the test above covers.
    await page.keyboard.press("Enter");
    await test.expect(menu).toBeVisible();
    await test.expect(q.menuitem("New")).toBeFocused();

    // The popover settles its position asynchronously, so poll the geometry
    // instead of sampling it once.
    await test.expect
      .poll(async () => {
        const fileBox = await file.boundingBox();
        const menuBox = await menu.boundingBox();
        if (!fileBox || !menuBox) return -Infinity;
        return menuBox.x - (fileBox.x + fileBox.width - 1);
      })
      .toBeGreaterThanOrEqual(0);
  });
});
