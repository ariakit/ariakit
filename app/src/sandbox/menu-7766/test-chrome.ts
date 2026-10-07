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
});
