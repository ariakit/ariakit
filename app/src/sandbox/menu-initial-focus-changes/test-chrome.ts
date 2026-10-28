import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The menu button of a modal menu stays available while the menu is open, so
  // the user can move to it and close the menu from there. Focus must stay on
  // the button while the menu is open, and the next open must still give the
  // initial focus to the item that is first then.
  // https://github.com/ariakit/ariakit/issues/7791
  test("gives the initial focus to the first item when a modal menu opens again after it closed from its menu button", async ({
    page,
    q,
  }) => {
    const button = q.button("Modal edit");

    await button.focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();
    // Pasting creates the history that puts Undo first in the next open.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeVisible();

    await page.keyboard.press("Shift+Tab");
    await test.expect(button).toBeFocused();
    // Focus that stays put has no positive state. The menu would take focus
    // again asynchronously, after the commit that follows the focus event of
    // the button, so wait through it.
    await flushFrames(page);
    await test.expect(button).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.menu("Modal edit")).toBeHidden();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeFocused();
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
});
