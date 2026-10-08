import { click, focus, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// A menu takes its initial focus when it opens. An item that arrives later
// changes which item is first, but there is no initial focus left to give, so
// focus must stay on the item the user is on.
// https://github.com/ariakit/ariakit/issues/7766
test("keeps focus in place when an item arrives at the top of an open menu", async () => {
  await focus(q.button("Edit"));
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();

  await press.ArrowDown();
  await press.ArrowDown();
  const item = q.menuitem("Paste");
  expect(item).toHaveFocus();

  // `press` settles the DOM before it resolves, so an initial focus that the
  // menu takes again would already have moved.
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();
  expect(item).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
});

// The item that received the initial focus can leave the menu after the user
// moved away from it. The item that becomes first must not take focus either.
// https://github.com/ariakit/ariakit/issues/7766
test("keeps focus in place when the first item of an open menu is removed", async () => {
  const button = q.button("Edit");
  await focus(button);
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  // Pasting creates the history that puts Undo first in the next open.
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();
  await press.Escape();
  expect(button).toHaveFocus();

  await press.Enter();
  await expect.poll(() => q.menuitem("Undo")).toHaveFocus();
  await press.End();
  const item = q.menuitem("Clear history");
  expect(item).toHaveFocus();

  // `press` settles the DOM before it resolves, so an initial focus that the
  // menu takes again would already have moved.
  await press.Enter();
  expect(q.menuitem.maybe("Undo")).not.toBeInTheDocument();
  expect(item).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
});

// The first item that can take the initial focus also changes when an item that
// stays in the menu becomes enabled.
// https://github.com/ariakit/ariakit/issues/7766
test("keeps focus in place when the first item of an open menu becomes enabled", async () => {
  await focus(q.button("Edit with disabled Undo"));
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();

  await press.ArrowDown();
  await press.ArrowDown();
  const item = q.menuitem("Paste");
  expect(item).toHaveFocus();

  // `press` settles the DOM before it resolves, so an initial focus that the
  // menu takes again would already have moved.
  await press.Enter();
  expect(q.menuitem("Undo")).not.toHaveAttribute("aria-disabled", "true");
  expect(item).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
});

// https://github.com/ariakit/ariakit/issues/7766
test("keeps focus in place when the first item of an open menu becomes disabled", async () => {
  const button = q.button("Edit with disabled Undo");
  await focus(button);
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  // Pasting creates the history that puts Undo first in the next open.
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).not.toHaveAttribute("aria-disabled", "true");
  await press.Escape();
  expect(button).toHaveFocus();

  await press.Enter();
  await expect.poll(() => q.menuitem("Undo")).toHaveFocus();
  await press.End();
  const item = q.menuitem("Clear history");
  expect(item).toHaveFocus();

  // `press` settles the DOM before it resolves, so an initial focus that the
  // menu takes again would already have moved.
  await press.Enter();
  expect(q.menuitem("Undo")).toHaveAttribute("aria-disabled", "true");
  expect(item).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
});

for (const label of ["Edit with submenu", "Edit with portal submenu"]) {
  // The item the user is on can be in a submenu. The parent menu must not take
  // its initial focus again, whether the submenu renders inside the parent menu
  // element or in a portal.
  // https://github.com/ariakit/ariakit/issues/7766
  test(`keeps focus in the submenu when an item arrives at the top of the "${label}" menu`, async () => {
    await focus(q.button(label));
    await press.Enter();
    await expect.poll(() => q.menuitem("Cut")).toHaveFocus();

    await press.End();
    expect(q.menuitem("Paste special")).toHaveFocus();
    await press.ArrowRight();
    const item = q.menuitem("Paste as text");
    await expect.poll(() => item).toHaveFocus();

    // `press` settles the DOM before it resolves, so an initial focus that the
    // parent menu takes again would already have moved.
    await press.Enter();
    expect(q.menuitem("Undo")).toBeVisible();
    expect(item).toHaveFocus();
    expect(item).toHaveAttribute("data-active-item");
  });
}

// With virtual focus, DOM focus stays on the menu element, and the item the
// user is on is the active item. An item that arrives must not take its place.
// https://github.com/ariakit/ariakit/issues/7766
test("keeps the active item in place when an item arrives at the top of an open menu with virtual focus", async () => {
  await focus(q.button("Edit with virtual focus"));
  await press.Enter();
  const menu = q.menu("Edit with virtual focus");
  await expect
    .poll(() => q.menuitem("Cut"))
    .toHaveAttribute("data-active-item");

  await press.ArrowDown();
  await press.ArrowDown();
  const item = q.menuitem("Paste");
  expect(item).toHaveAttribute("data-active-item");

  // `press` settles the DOM before it resolves, so an initial focus that the
  // menu takes again would already have moved the active item.
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();
  expect(menu).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
  expect(q.menuitem("Undo")).not.toHaveAttribute("data-active-item");
});

// The active item can be the one that leaves. DOM focus is still on the menu
// element, but the user is not on an item any more, so the menu takes its
// initial focus again on the item that is now first. That item is the one that
// had the initial focus before Undo arrived.
// https://github.com/ariakit/ariakit/issues/7766
test("moves to the first item when the active item of a menu with virtual focus is removed", async () => {
  await focus(q.button("Edit with virtual focus"));
  await press.Enter();
  const menu = q.menu("Edit with virtual focus");
  await expect
    .poll(() => q.menuitem("Cut"))
    .toHaveAttribute("data-active-item");
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();
  await press.Home();
  expect(q.menuitem("Undo")).toHaveAttribute("data-active-item");

  // Undo uses up the history, so it leaves the menu.
  await press.Enter();
  expect(q.menuitem.maybe("Undo")).not.toBeInTheDocument();
  await expect
    .poll(() => q.menuitem("Cut"))
    .toHaveAttribute("data-active-item");
  expect(menu).toHaveFocus();
});

// The active item can become disabled and stay in the menu. The user cannot
// stay on it, so the menu takes its initial focus again on the first enabled
// item.
// https://github.com/ariakit/ariakit/issues/7766
test("moves to the first enabled item when the active item of a menu with virtual focus becomes disabled", async () => {
  const label = "Edit with virtual focus and disabled Undo";
  await focus(q.button(label));
  await press.Enter();
  const menu = q.menu(label);
  await expect
    .poll(() => q.menuitem("Cut"))
    .toHaveAttribute("data-active-item");
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).not.toHaveAttribute("aria-disabled", "true");
  await press.Home();
  expect(q.menuitem("Undo")).toHaveAttribute("data-active-item");

  // Undo uses up the history, so it becomes disabled.
  await press.Enter();
  expect(q.menuitem("Undo")).toHaveAttribute("aria-disabled", "true");
  await expect
    .poll(() => q.menuitem("Cut"))
    .toHaveAttribute("data-active-item");
  expect(menu).toHaveFocus();
});

// The focused item can be the one that leaves. Focus leaves the menu with it,
// so the menu takes its initial focus again on the item that is now first. That
// item is the one that had the initial focus before Undo arrived.
// https://github.com/ariakit/ariakit/issues/7766
test("moves focus to the first item when the focused item of an open menu is removed", async () => {
  await focus(q.button("Edit"));
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();
  await press.Home();
  expect(q.menuitem("Undo")).toHaveFocus();

  // Undo uses up the history, so it leaves the menu.
  await press.Enter();
  expect(q.menuitem.maybe("Undo")).not.toBeInTheDocument();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
});

// The focused item can become disabled, and it can still have DOM focus when
// the menu checks where the user is. The user cannot stay on that item, so the
// menu takes its initial focus again on the first enabled item.
// https://github.com/ariakit/ariakit/issues/7766
test("moves focus to the first enabled item when the focused item of an open menu becomes disabled", async () => {
  await focus(q.button("Edit with disabled Undo"));
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).not.toHaveAttribute("aria-disabled", "true");
  await press.Home();
  expect(q.menuitem("Undo")).toHaveFocus();

  // Undo uses up the history, so it becomes disabled.
  await press.Enter();
  expect(q.menuitem("Undo")).toHaveAttribute("aria-disabled", "true");
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
});

// The menu button of a modal menu counts as inside the menu, and the menu opens
// with focus on it. A target that left the menu while the user was on another
// item must not stay for the next open.
// https://github.com/ariakit/ariakit/issues/7766
test("gives the initial focus to the first item when a modal menu opens again after its first item was removed", async () => {
  const button = q.button("Modal edit with history");
  await focus(button);
  await press.Enter();
  await expect.poll(() => q.menuitem("Undo")).toHaveFocus();
  await press.End();
  expect(q.menuitem("Clear history")).toHaveFocus();
  await press.Enter();
  expect(q.menuitem.maybe("Undo")).not.toBeInTheDocument();
  await press.Escape();
  expect(button).toHaveFocus();

  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
});

// The item that received the initial focus can stay in the menu while another
// item arrives above it. The next open must give the initial focus to the item
// that is first then, not to the one that was first before.
// https://github.com/ariakit/ariakit/issues/7791
test("gives the initial focus to the first item when a modal menu opens again after an item arrived at its top", async () => {
  const button = q.button("Modal edit");
  await focus(button);
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  // Pasting creates the history that puts Undo first in the next open.
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();
  await press.Escape();
  expect(button).toHaveFocus();

  await press.Enter();
  await expect.poll(() => q.menuitem("Undo")).toHaveFocus();
});

// The menu button of a modal menu stays available while the menu is open, so
// the user can move to it and close the menu from there. Focus must stay on the
// button while the menu is open, and the next open must still give the initial
// focus to the item that is first then.
// https://github.com/ariakit/ariakit/issues/7791
test("gives the initial focus to the first item when a modal menu opens again after it closed from its menu button", async () => {
  const button = q.button("Modal edit");
  await focus(button);
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  // Pasting creates the history that puts Undo first in the next open.
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();

  // `press` settles the DOM before it resolves, so a menu that takes focus
  // again would already have moved it.
  await press.ShiftTab();
  expect(button).toHaveFocus();

  await press.Enter();
  expect(q.menu.maybe("Modal edit")).not.toBeInTheDocument();
  await press.Enter();
  await expect.poll(() => q.menuitem("Undo")).toHaveFocus();
});

// A modal menu must also keep focus on the item the user is on when the item
// that received the initial focus leaves the menu.
// https://github.com/ariakit/ariakit/issues/7791
test("keeps focus in place when the first item of an open modal menu is removed", async () => {
  await focus(q.button("Modal edit with history"));
  await press.Enter();
  await expect.poll(() => q.menuitem("Undo")).toHaveFocus();
  await press.End();
  const item = q.menuitem("Clear history");
  expect(item).toHaveFocus();

  // `press` settles the DOM before it resolves, so an initial focus that the
  // menu takes again would already have moved.
  await press.Enter();
  expect(q.menuitem.maybe("Undo")).not.toBeInTheDocument();
  expect(item).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
});

// The mouse gives the initial focus to the menu element. The item that received
// the initial focus of an earlier keyboard open must not take its place.
// https://github.com/ariakit/ariakit/issues/7791
test("gives the initial focus to the menu element when a modal menu opens with the mouse after a keyboard open", async () => {
  const button = q.button("Modal edit");
  await focus(button);
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  await press.Escape();
  expect(button).toHaveFocus();

  await click(button);
  await expect.poll(() => q.menu("Modal edit")).toHaveFocus();
});

// A trigger that shows the menu through the store does not turn auto focus on,
// so a modal menu gives its initial focus to the menu element. The menu gets no
// new target then, and the target of an earlier open must not stay for it.
// https://github.com/ariakit/ariakit/issues/7791
test("gives the initial focus to the menu element when a modal menu opens without auto focus after a keyboard open", async () => {
  const button = q.button("Row actions");
  await focus(button);
  await press.Enter();
  await expect.poll(() => q.menuitem("Rename")).toHaveFocus();
  await press.Escape();
  expect(button).toHaveFocus();

  await click(q.button("Open row actions"));
  await expect.poll(() => q.menu("Row actions")).toHaveFocus();
});

// The focused item of a modal menu can be the one that leaves. Focus leaves the
// menu with it, so the menu takes its initial focus again on the item that is
// now first, as a menu that is not modal does.
// https://github.com/ariakit/ariakit/issues/7791
test("moves focus to the first item when the focused item of an open modal menu is removed", async () => {
  await focus(q.button("Modal edit"));
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).toBeVisible();
  await press.Home();
  expect(q.menuitem("Undo")).toHaveFocus();

  // Undo uses up the history, so it leaves the menu.
  await press.Enter();
  expect(q.menuitem.maybe("Undo")).not.toBeInTheDocument();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
});

// The focused item of a modal menu can become disabled. The user cannot stay on
// that item, so the menu takes its initial focus again on the first enabled
// item, as a menu that is not modal does.
// https://github.com/ariakit/ariakit/issues/7791
test("moves focus to the first enabled item when the focused item of an open modal menu becomes disabled", async () => {
  await focus(q.button("Modal edit with disabled Undo"));
  await press.Enter();
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitem("Undo")).not.toHaveAttribute("aria-disabled", "true");
  await press.Home();
  expect(q.menuitem("Undo")).toHaveFocus();

  // Undo uses up the history, so it becomes disabled.
  await press.Enter();
  expect(q.menuitem("Undo")).toHaveAttribute("aria-disabled", "true");
  await expect.poll(() => q.menuitem("Cut")).toHaveFocus();
});

for (const label of ["Modal bookmarks", "Inline modal bookmarks"]) {
  // A modal menu opens with focus on its menu button, which counts as inside
  // the menu, and the Close button takes focus while the bookmarks load. The
  // user chose neither place, so the menu still owes its initial focus to the
  // first item that arrives. This applies to a menu that stays mounted and to a
  // menu that mounts next to its button when it opens.
  // https://github.com/ariakit/ariakit/issues/7791
  test(`gives the initial focus to the first item that arrives in the "${label}" menu`, async () => {
    await focus(q.button(label));
    await press.Enter();
    await expect.poll(() => q.button("Close")).toHaveFocus();
    expect(q.menuitem.maybe("Ariakit")).not.toBeInTheDocument();
    // The bookmarks arrive 1000ms after the menu opens.
    await expect
      .poll(() => q.menuitem.maybe("Ariakit"), { timeout: 3000 })
      .toHaveFocus();
  });
}

// A menu that opens before it has an item still owes its initial focus to the
// first item that arrives. Focus is on the menu element until then, and that
// must not count as focus to keep in place.
// https://github.com/ariakit/ariakit/issues/7766
test("gives the initial focus to the first item that arrives in a menu that opened without items", async () => {
  await focus(q.button("Bookmarks"));
  await press.Enter();
  await expect.poll(() => q.menu("Bookmarks")).toHaveFocus();
  expect(q.menuitem.maybe("Ariakit")).not.toBeInTheDocument();
  // The bookmarks arrive 1000ms after the menu opens.
  await expect
    .poll(() => q.menuitem.maybe("Ariakit"), { timeout: 3000 })
    .toHaveFocus();
});

// While a menu loads its items again, it has no item to focus, and the dialog
// gives its fallback focus to the first control in the menu. The user did not
// choose that control, so the menu still owes its initial focus to the first
// item that arrives.
// https://github.com/ariakit/ariakit/issues/7766
test("gives the initial focus to the first item that arrives after a menu reloads its items", async () => {
  await focus(q.button("Bookmarks"));
  await press.Enter();
  // The bookmarks arrive 1000ms after the menu opens.
  await expect
    .poll(() => q.menuitem.maybe("Ariakit"), { timeout: 3000 })
    .toHaveFocus();
  await press.End();
  expect(q.menuitem("Reload")).toHaveFocus();

  await press.Enter();
  await expect.poll(() => q.button("Close")).toHaveFocus();
  expect(q.menuitem.maybe("Ariakit")).not.toBeInTheDocument();
  // The bookmarks arrive 1000ms after the reload starts.
  await expect
    .poll(() => q.menuitem.maybe("Ariakit"), { timeout: 3000 })
    .toHaveFocus();
});

// A control that is not an item can disable itself in the update that changes
// the first enabled item. It still has DOM focus when the menu checks where the
// user is, but it is about to lose it, so the menu takes focus again and focus
// stays inside the menu.
// https://github.com/ariakit/ariakit/issues/7766
test("keeps focus inside the menu when a focused control of the menu disables itself", async () => {
  await focus(q.button("Bookmarks"));
  await press.Enter();
  // The bookmarks arrive 1000ms after the menu opens.
  await expect
    .poll(() => q.menuitem.maybe("Ariakit"), { timeout: 3000 })
    .toHaveFocus();
  await press.Tab();
  expect(q.button("Clear")).toHaveFocus();

  await press.Enter();
  expect(q.button("Clear")).toBeDisabled();
  await expect.poll(() => q.button("Close")).toHaveFocus();
});

// The user can be on a control of the menu that is not an item. The items can
// change while that control has focus, also to no item and back, and focus must
// stay on the control.
// https://github.com/ariakit/ariakit/issues/7766
test("keeps focus on a control of the menu when the items change", async () => {
  await focus(q.button("Bookmarks"));
  await press.Enter();
  // The bookmarks arrive 1000ms after the menu opens.
  await expect
    .poll(() => q.menuitem.maybe("Ariakit"), { timeout: 3000 })
    .toHaveFocus();
  await press.ShiftTab();
  const filter = q.textbox("Filter bookmarks");
  expect(filter).toHaveFocus();

  // React becomes the first item. `type` settles the DOM before it resolves, so
  // an initial focus that the menu takes again would already have moved.
  await type("e");
  expect(q.menuitem.maybe("Ariakit")).not.toBeInTheDocument();
  expect(q.menuitem("React")).toBeVisible();
  expect(filter).toHaveFocus();

  // No bookmark matches, and then all of them match again.
  await type("x");
  expect(q.menuitem("No bookmarks")).toBeVisible();
  await type("\b\b");
  expect(q.menuitem("Ariakit")).toBeVisible();
  expect(filter).toHaveFocus();
});
