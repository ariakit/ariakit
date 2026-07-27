import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/1662
  test("does not hide an open hovercard on wheel", async ({ page, q }) => {
    const anchor = q.link("@ariakit.com");
    const hovercard = q.dialog("Ariakit profile");

    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(hovercard).not.toBeVisible();
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(50);
    await test.expect(hovercard).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(hovercard).not.toBeVisible();
  });
});
