import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("clicking a menu item scrolls the menu button into view", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Actions");

    await test.expect(menuButton).toBeVisible();

    const { x, y, scrollY } = await menuButton.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY + rect.bottom - 10;
      window.scrollTo(0, scrollY);
      const scrolledRect = element.getBoundingClientRect();
      return {
        x: scrolledRect.left + scrolledRect.width / 2,
        y: scrolledRect.bottom - 5,
        scrollY,
      };
    });

    await page.mouse.click(x, y);
    await test.expect(q.menu()).toBeVisible();

    await q.text("CLICK THIS").click();
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(menuButton).toBeFocused();

    await test.expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeLessThan(scrollY);
  });

  test("clicking outside does not scroll the menu button into view", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Actions");

    await test.expect(menuButton).toBeVisible();

    const { x, y, scrollY } = await menuButton.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY + rect.bottom - 10;
      window.scrollTo(0, scrollY);
      const scrolledRect = element.getBoundingClientRect();
      return {
        x: scrolledRect.left + scrolledRect.width / 2,
        y: scrolledRect.bottom - 5,
        scrollY,
      };
    });

    await page.mouse.click(x, y);
    await test.expect(q.menu()).toBeVisible();

    await page.mouse.click(10, 5);
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(menuButton).not.toBeFocused();

    await test.expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBe(scrollY);
  });
});
