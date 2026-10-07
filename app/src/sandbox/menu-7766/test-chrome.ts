import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // A menu takes its initial focus when it opens. An item that arrives later
  // changes which item is first, but there is no initial focus left to give, so
  // focus must stay on the item the user is on.
  // https://github.com/ariakit/ariakit/issues/7766
  test("keeps focus in place when an item arrives at the top of an open menu", async ({
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

  // The item that received the initial focus can leave the menu after the user
  // moved away from it. The item that becomes first must not take focus either.
  // https://github.com/ariakit/ariakit/issues/7766
  test("keeps focus in place when the first item of an open menu is removed", async ({
    page,
    q,
  }) => {
    const button = q.button("Edit");
    const item = q.menuitem("Clear history");

    await button.focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();
    // Pasting creates the history that puts Undo first in the next open.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(button).toBeFocused();
    // A menu that Escape closed closes once more if it is open two frames
    // later, which guards against its button showing it again. No state tracks
    // that guard, so let those frames pass before the menu opens again.
    await flushFrames(page);

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(item).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toHaveCount(0);
    // Focus that stays put has no positive state. The menu would take its
    // initial focus again asynchronously, after the commit that removes the
    // item, so wait through it.
    await flushFrames(page);
    await test.expect(item).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
  });

  // The first item that can take the initial focus also changes when an item
  // that stays in the menu becomes enabled.
  // https://github.com/ariakit/ariakit/issues/7766
  test("keeps focus in place when the first item of an open menu becomes enabled", async ({
    page,
    q,
  }) => {
    const item = q.menuitem("Paste");

    await q.button("Edit with disabled Undo").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(item).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeEnabled();
    // Focus that stays put has no positive state. The menu would take its
    // initial focus again asynchronously, after the commit that enables the
    // item, so wait through it.
    await flushFrames(page);
    await test.expect(item).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/7766
  test("keeps focus in place when the first item of an open menu becomes disabled", async ({
    page,
    q,
  }) => {
    const button = q.button("Edit with disabled Undo");
    const item = q.menuitem("Clear history");

    await button.focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();
    // Pasting creates the history that puts Undo first in the next open.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeEnabled();
    await page.keyboard.press("Escape");
    await test.expect(button).toBeFocused();
    // A menu that Escape closed closes once more if it is open two frames
    // later, which guards against its button showing it again. No state tracks
    // that guard, so let those frames pass before the menu opens again.
    await flushFrames(page);

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(item).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeDisabled();
    // Focus that stays put has no positive state. The menu would take its
    // initial focus again asynchronously, after the commit that disables the
    // item, so wait through it.
    await flushFrames(page);
    await test.expect(item).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
  });

  for (const label of ["Edit with submenu", "Edit with portal submenu"]) {
    // The item the user is on can be in a submenu. The parent menu must not
    // take its initial focus again, whether the submenu renders inside the
    // parent menu element or in a portal.
    // https://github.com/ariakit/ariakit/issues/7766
    test(`keeps focus in the submenu when an item arrives at the top of the "${label}" menu`, async ({
      page,
      q,
    }) => {
      const item = q.menuitem("Paste as text");

      await q.button(label).focus();
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
  }

  // With virtual focus, DOM focus stays on the menu element, and the item the
  // user is on is the active item. An item that arrives must not take its
  // place.
  // https://github.com/ariakit/ariakit/issues/7766
  test("keeps the active item in place when an item arrives at the top of an open menu with virtual focus", async ({
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

  // The active item can be the one that leaves. DOM focus is still on the menu
  // element, but the user is not on an item any more, so the menu takes its
  // initial focus again on the item that is now first. That item is the one
  // that had the initial focus before Undo arrived.
  // https://github.com/ariakit/ariakit/issues/7766
  test("moves to the first item when the active item of a menu with virtual focus is removed", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Edit with virtual focus");

    await q.button("Edit with virtual focus").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeVisible();
    await page.keyboard.press("Home");
    await test.expect(q.menuitem("Undo")).toHaveAttribute("data-active-item");

    // Undo uses up the history, so it leaves the menu.
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toHaveCount(0);
    await test.expect(q.menuitem("Cut")).toHaveAttribute("data-active-item");
    await test.expect(menu).toBeFocused();
  });

  // The active item can become disabled and stay in the menu. The user cannot
  // stay on it, so the menu takes its initial focus again on the first enabled
  // item.
  // https://github.com/ariakit/ariakit/issues/7766
  test("moves to the first enabled item when the active item of a menu with virtual focus becomes disabled", async ({
    page,
    q,
  }) => {
    const label = "Edit with virtual focus and disabled Undo";
    const menu = q.menu(label);

    await q.button(label).focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeEnabled();
    await page.keyboard.press("Home");
    await test.expect(q.menuitem("Undo")).toHaveAttribute("data-active-item");

    // Undo uses up the history, so it becomes disabled.
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeDisabled();
    await test.expect(q.menuitem("Cut")).toHaveAttribute("data-active-item");
    await test.expect(menu).toBeFocused();
  });

  // The focused item can be the one that leaves. Focus leaves the menu with it,
  // so the menu takes its initial focus again on the item that is now first.
  // That item is the one that had the initial focus before Undo arrived.
  // https://github.com/ariakit/ariakit/issues/7766
  test("moves focus to the first item when the focused item of an open menu is removed", async ({
    page,
    q,
  }) => {
    await q.button("Edit").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeVisible();
    await page.keyboard.press("Home");
    await test.expect(q.menuitem("Undo")).toBeFocused();

    // Undo uses up the history, so it leaves the menu.
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toHaveCount(0);
    await test.expect(q.menuitem("Cut")).toBeFocused();
  });

  // A modal menu keeps its initial focus target between two opens, and its menu
  // button counts as inside the menu. A target that left the menu while the
  // user was on another item must not stay for the next open.
  // https://github.com/ariakit/ariakit/issues/7766
  test("gives the initial focus to the first item when a modal menu opens again after its first item was removed", async ({
    page,
    q,
  }) => {
    const button = q.button("Modal edit with history");

    await button.focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(q.menuitem("Clear history")).toBeFocused();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await test.expect(button).toBeFocused();
    // A menu that Escape closed closes once more if it is open two frames
    // later, which guards against its button showing it again. No state tracks
    // that guard, so let those frames pass before the menu opens again.
    await flushFrames(page);

    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();
  });

  // A menu that opens before it has an item still owes its initial focus to the
  // first item that arrives. Focus is on the menu element until then, and that
  // must not count as focus to keep in place.
  // https://github.com/ariakit/ariakit/issues/7766
  test("gives the initial focus to the first item that arrives in a menu that opened without items", async ({
    page,
    q,
  }) => {
    await q.button("Bookmarks").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menu("Bookmarks")).toBeFocused();
    await test.expect(q.menuitem("Ariakit")).toHaveCount(0);
    await test.expect(q.menuitem("Ariakit")).toBeFocused();
  });

  // While a menu loads its items again, it has no item to focus, and the dialog
  // gives its fallback focus to the first control in the menu. The user did not
  // choose that control, so the menu still owes its initial focus to the first
  // item that arrives.
  // https://github.com/ariakit/ariakit/issues/7766
  test("gives the initial focus to the first item that arrives after a menu reloads its items", async ({
    page,
    q,
  }) => {
    await q.button("Bookmarks").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Ariakit")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(q.menuitem("Reload")).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.button("Close")).toBeFocused();
    await test.expect(q.menuitem("Ariakit")).toHaveCount(0);
    await test.expect(q.menuitem("Ariakit")).toBeFocused();
  });

  // A control that is not an item can disable itself in the update that changes
  // the first enabled item. It still has DOM focus when the menu checks where
  // the user is, but it is about to lose it, so the menu takes focus again and
  // focus stays inside the menu.
  // https://github.com/ariakit/ariakit/issues/7766
  test("keeps focus inside the menu when a focused control of the menu disables itself", async ({
    page,
    q,
  }) => {
    await q.button("Bookmarks").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Ariakit")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Clear")).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.button("Clear")).toBeDisabled();
    await test.expect(q.button("Close")).toBeFocused();
  });

  // The user can be on a control of the menu that is not an item. The items can
  // change while that control has focus, also to no item and back, and focus
  // must stay on the control.
  // https://github.com/ariakit/ariakit/issues/7766
  test("keeps focus on a control of the menu when the items change", async ({
    page,
    q,
  }) => {
    const filter = q.textbox("Filter bookmarks");

    await q.button("Bookmarks").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Ariakit")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(filter).toBeFocused();

    // React becomes the first item.
    await page.keyboard.type("e");
    await test.expect(q.menuitem("Ariakit")).toHaveCount(0);
    await test.expect(q.menuitem("React")).toBeVisible();
    // Focus that stays put has no positive state. The menu would take its
    // initial focus again asynchronously, after the commit that removes the
    // item, so wait through it.
    await flushFrames(page);
    await test.expect(filter).toBeFocused();

    // No bookmark matches, and then all of them match again.
    await page.keyboard.type("x");
    await test.expect(q.menuitem("No bookmarks")).toBeVisible();
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await test.expect(q.menuitem("Ariakit")).toBeVisible();
    // The same wait as above, for the commit that brings the items back.
    await flushFrames(page);
    await test.expect(filter).toBeFocused();
  });
});
