import { gotoAndHydrate, withFramework } from "#app/test-utils/preview.ts";

// The hovercards of the sandbox show after 20ms and hide after 200ms.
const SHOW_TIMEOUT = 20;
const HIDE_TIMEOUT = 200;

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8490
  test("stays open when focus moves into it while a hide is pending", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit.com");
    const hovercard = q.dialog("Ariakit profile");
    const follow = q.button("Follow");
    await anchor.focus();
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    // The mouse moves away from the anchor, not toward the hovercard, which
    // schedules a hide.
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await test.expect(follow).toBeFocused();
    // The pending hide would run after the hide timeout, and no state shows
    // that the timeout passed without it.
    await page.waitForTimeout(HIDE_TIMEOUT + 100);
    await test.expect(hovercard).toHaveAttribute("data-open");
    await test.expect(follow).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/8490
  test("stays open when focus moves into a nested hovercard while a hide is pending", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Ariakit team");
    const nestedAnchor = q.link("@diegohaz");
    const hovercard = q.dialog("Team members");
    const nestedHovercard = q.dialog("Member profile");
    const message = q.button("Message");
    await anchor.focus();
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await nestedAnchor.hover();
    await test.expect(nestedHovercard).toBeVisible();
    // The mouse moves away from both hovercards, which schedules their hides.
    await page.mouse.move(0, 0);
    // Two Tab presses move focus through the nested anchor into the nested
    // hovercard. A focus check between them could use up the hide timeout.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(message).toBeFocused();
    // The pending hides would run after the hide timeout, and no state shows
    // that the timeout passed without them.
    await page.waitForTimeout(HIDE_TIMEOUT + 100);
    await test.expect(hovercard).toHaveAttribute("data-open");
    await test.expect(nestedHovercard).toHaveAttribute("data-open");
    await test.expect(message).toBeFocused();
  });

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
    test.expect(box).not.toBeNull();
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
