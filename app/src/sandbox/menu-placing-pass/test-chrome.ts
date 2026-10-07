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
});
