import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Box = NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>;

withFramework(import.meta.dirname, async ({ test }) => {
  // The popover settles its position asynchronously, so poll the geometry
  // instead of sampling it once.
  const expectGap = (
    anchor: Locator,
    popover: Locator,
    getGap: (anchorBox: Box, popoverBox: Box) => number,
  ) =>
    test.expect
      .poll(async () => {
        const anchorBox = await anchor.boundingBox();
        const popoverBox = await popover.boundingBox();
        if (!anchorBox || !popoverBox) return -Infinity;
        return getGap(anchorBox, popoverBox);
      })
      .toBeGreaterThanOrEqual(0);

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

    await expectGap(file, menu, (anchor, popover) => {
      return popover.x - (anchor.x + anchor.width - 1);
    });
  });

  // https://github.com/ariakit/ariakit/issues/7410
  test("an explicit placement wins in a right-to-left menubar", async ({
    page,
    q,
  }) => {
    const insert = q.menuitem("Insert");
    const menu = q.menu("Insert");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(insert).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await test.expect(menu).toBeVisible();
    await test.expect(q.menuitem("Image")).toBeFocused();

    await expectGap(insert, menu, (anchor, popover) => {
      return anchor.x - (popover.x + popover.width - 1);
    });

    await page.keyboard.press("ArrowRight");
    await test.expect(menu).not.toBeVisible();
    await test.expect(insert).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Format")).toBeFocused();
    await test.expect(q.menu("Format")).not.toBeVisible();
  });
});
