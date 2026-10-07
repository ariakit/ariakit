import { focus, press, q } from "@ariakit/test";
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
