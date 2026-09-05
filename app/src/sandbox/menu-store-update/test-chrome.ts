import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The popover settles its position asynchronously, so poll the geometry
  // instead of sampling it once. The 1px tolerance covers subpixel rounding.
  const expectBeside = (anchor: Locator, popover: Locator) =>
    test.expect
      .poll(async () => {
        const anchorBox = await anchor.boundingBox();
        const popoverBox = await popover.boundingBox();
        if (!anchorBox || !popoverBox) return -Infinity;
        return popoverBox.x - (anchorBox.x + anchorBox.width - 1);
      })
      .toBeGreaterThanOrEqual(0);

  // https://github.com/ariakit/ariakit/pull/7414#discussion_r3940621814
  test("a placement written with setState survives a linked disclosure change", async ({
    page,
    q,
  }) => {
    const actions = q.button("Actions");
    const menu = q.menu("Actions");

    await q.button("Open beside").click();
    await page.keyboard.press("Shift+Tab");
    await test.expect(actions).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(menu).toBeVisible();
    await test.expect(q.menuitem("Rename")).toBeFocused();
    await test.expect(q.text("First panel content")).toBeVisible();
    await expectBeside(actions, menu);

    await page.keyboard.press("Escape");
    await test.expect(menu).not.toBeVisible();
    await test.expect(actions).toBeFocused();

    await q.button("Link to second panel").click();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await test.expect(actions).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(menu).toBeVisible();
    await test.expect(q.menuitem("Rename")).toBeFocused();
    await test.expect(q.text("Second panel content")).toBeVisible();
    await expectBeside(actions, menu);
  });

  // https://github.com/ariakit/ariakit/pull/7414#discussion_r3940228527
  test("a submenu follows a replaced parent store", async ({ page, q }) => {
    const share = q.menuitem("Share");
    const menu = q.menu("Share");

    await q.menuitem("Save").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(share).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(menu).toBeVisible();
    await test.expect(q.menuitem("Email")).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(menu).not.toBeVisible();
    await test.expect(share).toBeFocused();

    await q.button("Show as sidebar").click();
    await q.menuitem("Save").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(share).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(menu).toBeVisible();
    await test.expect(q.menuitem("Email")).toBeFocused();
    await expectBeside(share, menu);
  });
});
