import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Inside a shadow root, the document reports the shadow host as its focused
  // element, and only the shadow root knows which item has focus. An item that
  // arrives at the top of the menu must not take focus from that item.
  // https://github.com/ariakit/ariakit/issues/7794
  test("keeps focus in place when an item arrives at the top of an open menu in a shadow root", async ({
    page,
    q,
  }) => {
    const item = q.menuitem("Paste");

    await q.button("Edit").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(item).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeVisible();
    // Focus that stays put has no positive state. The menu would take its
    // initial focus again asynchronously, after the commit the new item
    // reports, so wait through it.
    await flushFrames(page);
    await test.expect(item).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
  });

  // With virtual focus, DOM focus stays on the menu element, and the item the
  // user is on is the active item. The shadow root reports the menu element as
  // focused, so an item that arrives must not take the place of the active one.
  // https://github.com/ariakit/ariakit/issues/7794
  test("keeps the active item in place when an item arrives at the top of an open menu with virtual focus in a shadow root", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Edit with virtual focus");
    const item = q.menuitem("Paste");

    await q.button("Edit with virtual focus").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(item).toHaveAttribute("data-active-item");

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeVisible();
    // An active item that stays put has no positive state. The menu would take
    // its initial focus again asynchronously, after the commit the new item
    // reports, so wait through it.
    await flushFrames(page);
    await test.expect(menu).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
    await test
      .expect(q.menuitem("Undo"))
      .not.toHaveAttribute("data-active-item");
  });

  // A submenu in a portal renders outside the shadow root, so the shadow root
  // has no focused element while the user is in the submenu. The parent menu
  // must still see that focus, which the document reports.
  // https://github.com/ariakit/ariakit/issues/7794
  test("keeps focus in a portal submenu when an item arrives at the top of its parent menu in a shadow root", async ({
    page,
    q,
  }) => {
    const item = q.menuitem("Paste as text");

    await q.button("Edit with portal submenu").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();

    await page.keyboard.press("End");
    await test.expect(q.menuitem("Paste special")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(item).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeVisible();
    // Focus that stays put has no positive state. The parent menu would take
    // its initial focus again asynchronously, after the commit the new item
    // reports, so wait through it.
    await flushFrames(page);
    await test.expect(item).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
  });
});
