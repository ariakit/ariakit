import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // A popup takes its initial focus once each time it opens. A pass that runs
  // later, while the popup is open, has no initial focus left to give, so it
  // must leave focus on the item the user moved to.
  // https://github.com/ariakit/ariakit/issues/7625
  test("keeps focus on a moved item after an open popup repositions itself", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Actions");
    const finish = q.button("Finish Actions positioning");
    const item = q.menuitem("Action 3");

    await q.button("Actions").focus();
    await page.keyboard.press("Enter");
    await test.expect(menu).toHaveAttribute("data-placing");
    // The buttons that drive a pass stand in for work the application does on
    // its own, so they are dispatched to. A native click would move focus out
    // of the menu, and the popup never takes focus back from outside.
    await finish.dispatchEvent("click");
    await test.expect(q.menuitem("Action 1")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(item).toBeFocused();

    await q.button("Reposition Actions").dispatchEvent("click");
    await test.expect(menu).toHaveAttribute("data-placing");
    await finish.dispatchEvent("click");
    await test.expect(menu).not.toHaveAttribute("data-placing");
    // Focus that stays put has no positive state. The popup would take its
    // initial focus from an effect and a microtask that follow the commit the
    // attribute above reports, so wait through them.
    await flushFrames(page);
    await test.expect(item).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
  });

  // The initial focus that a popup took counts for one open. A popup that opens
  // again waits for its new pass, and then takes its initial focus again.
  // https://github.com/ariakit/ariakit/issues/7625
  test("holds the initial focus of a popup that opens again until it is placed", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Actions");
    const trigger = q.button("Actions");
    const finish = q.button("Finish Actions positioning");

    await trigger.click();
    await finish.click();
    await test.expect(menu).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(menu).toBeHidden();
    await test.expect(trigger).toBeFocused();

    await trigger.click();
    await test.expect(menu).toHaveAttribute("data-placing");
    // Focus that stays on the button has no positive state. The popup would
    // take its initial focus from an effect and a microtask that follow the
    // commit the attribute above reports, so wait through them.
    await flushFrames(page);
    await test.expect(trigger).toBeFocused();

    await finish.click();
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(menu).toBeFocused();
  });

  // Moving an open popup into a portal replaces its elements. The new element
  // starts at its origin and has not taken the initial focus, so the popup
  // takes it again, and only once that element has been positioned.
  // https://github.com/ariakit/ariakit/issues/7625
  test("holds the initial focus of a popup whose element is replaced until it is placed", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Portal actions");
    const finish = q.button("Finish Portal actions positioning");

    await q.button("Portal actions").click();
    await finish.click();
    await test.expect(menu).toBeFocused();

    // The move stands in for work the application does on its own, so it is
    // dispatched to. A native click would put focus on the button, where it
    // stays whether or not the popup waits.
    await q.button("Move Portal actions to a portal").dispatchEvent("click");
    await test.expect(menu).toHaveAttribute("data-placing");
    // Same checkpoint as above: a popup that waits has no positive state.
    await flushFrames(page);
    await test.expect(menu).not.toBeFocused();

    await finish.dispatchEvent("click");
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(menu).toBeFocused();
  });

  // A popup with a leave transition stays mounted while it leaves. When another
  // button opens it again in that time, it is a new open at a new place, so the
  // popup waits for the pass that moves it there.
  // https://github.com/ariakit/ariakit/issues/7625
  test("holds the initial focus of a popup that opens again while it is leaving until it is placed", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Row actions");
    const item = q.menuitem("Rename row");
    const finish = q.button("Finish Row actions positioning");
    const secondButton = q.button("Second row actions");

    await q.button("First row actions").focus();
    await page.keyboard.press("Enter");
    await test.expect(menu).toHaveAttribute("data-placing");
    // The button stands in for work the application does on its own, so it is
    // dispatched to. A native click outside the menu would close it.
    await finish.dispatchEvent("click");
    await test.expect(item).toBeFocused();

    // Focus on the other button closes the menu, which starts to leave.
    await secondButton.focus();
    await test.expect(menu).toHaveAttribute("data-leave");
    await page.keyboard.press("Enter");
    await test.expect(menu).toHaveAttribute("data-placing");
    // Focus that stays on the button has no positive state. The popup would
    // take its initial focus from an effect and a microtask that follow the
    // commit the attribute above reports, so wait through them.
    await flushFrames(page);
    await test.expect(secondButton).toBeFocused();

    await finish.dispatchEvent("click");
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(item).toBeFocused();
  });
});
