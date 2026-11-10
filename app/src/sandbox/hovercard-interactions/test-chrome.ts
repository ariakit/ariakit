import { gotoAndHydrate, withFramework } from "#app/test-utils/preview.ts";

// The hovercards of the sandbox show after 20ms.
const SHOW_TIMEOUT = 20;

withFramework(import.meta.dirname, async ({ test }) => {
  test("Escape keeps the hovercard closed while the pointer rests on the anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit.com");
    const hovercard = q.dialog("Ariakit profile");
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(hovercard).toBeHidden();
    // The pointer moves on the anchor, which doesn't show the hovercard again.
    // The hovercard would show after the show timeout, and no state shows that
    // the timeout passed without it.
    await anchor.hover({ position: { x: 2, y: 2 } });
    await anchor.hover({ position: { x: 4, y: 4 } });
    await page.waitForTimeout(SHOW_TIMEOUT + 100);
    await test.expect(hovercard).toBeHidden();
    // Once the pointer leaves the anchor, the anchor shows it again.
    await page.mouse.move(0, 0);
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
  });

  test("keeps the hovercard open when its anchor is clicked", async ({ q }) => {
    const anchor = q.link("@ariakit.com");
    const hovercard = q.dialog("Ariakit profile");
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await anchor.click();
    await test.expect(hovercard).toHaveAttribute("data-open");
  });

  test("hideOnClick hides the hovercard until the pointer leaves the anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Ariakit docs");
    const hovercard = q.dialog("Docs preview");
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await anchor.click();
    await test.expect(hovercard).toBeHidden();
    // The pointer moves on the anchor, which doesn't show the hovercard again.
    // The hovercard would show after the show timeout, and no state shows that
    // the timeout passed without it.
    await anchor.hover({ position: { x: 2, y: 2 } });
    await anchor.hover({ position: { x: 4, y: 4 } });
    await page.waitForTimeout(SHOW_TIMEOUT + 100);
    await test.expect(hovercard).toBeHidden();
    // Once the pointer leaves the anchor, the anchor shows it again.
    await page.mouse.move(0, 0);
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
  });

  test("hideOnClick blocks the hovercard after a click with no mouse move before it", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Ariakit docs");
    const hovercard = q.dialog("Docs preview");
    const box = await anchor.boundingBox();
    if (!box) return;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    // The page loads again under the resting mouse, so the click is the first
    // mouse event that reaches the anchor.
    await page.mouse.move(x, y);
    await gotoAndHydrate(page, page.url());
    await page.mouse.down();
    await page.mouse.up();
    await page.mouse.move(x + 2, y);
    await page.mouse.move(x + 4, y);
    // The hovercard would show after the show timeout, and no state shows that
    // the timeout passed without it.
    await page.waitForTimeout(SHOW_TIMEOUT + 100);
    await test.expect(hovercard).toBeHidden();
  });
});
