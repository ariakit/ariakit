import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("changes from a desktop popover to a mobile modal", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Accept invite");
    const popover = q.dialog("Team meeting");
    const positioningWrapper = popover.locator("..");

    await page.setViewportSize({ width: 768, height: 480 });
    await disclosure.click();
    await test.expect(popover).toBeVisible();
    await test.expect(q.button("Accept")).toBeFocused();
    await page.mouse.click(10, 10);
    await test.expect(popover).not.toBeVisible();
    await test.expect(disclosure).not.toBeFocused();

    await disclosure.click();
    await page.setViewportSize({ width: 480, height: 768 });
    await test.expect(positioningWrapper).toHaveCSS("position", "fixed");
    await test.expect(positioningWrapper).toHaveCSS("bottom", "0px");
    await test.expect(q.button("Accept")).toBeFocused();
    await page.mouse.click(10, 700);
    await test.expect(popover).not.toBeVisible();
    await test.expect(disclosure).not.toBeFocused();

    await disclosure.click();
    await test.expect(q.button("Accept")).toBeFocused();
  });
});
