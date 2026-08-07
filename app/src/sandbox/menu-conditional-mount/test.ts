import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// menu-default-open covers the page-load opening, where no element owns focus.

// https://github.com/ariakit/ariakit/issues/2946
test("takes focus when the menu mounts already open", async () => {
  await click(q.button("Add item"));

  expect(q.menu()).toBeVisible();
  expect(q.menu()).toHaveFocus();
  expect(q.menuitem("Rename")).not.toHaveAttribute("data-active-item");
});

// A modal menu already takes focus today, but onto the first item.
// https://github.com/ariakit/ariakit/issues/2946#issuecomment-4977621514
// #2946 redefines that for both modal modes: the container takes focus and
// nothing is highlighted.
// https://github.com/ariakit/ariakit/issues/2946
test("focuses the container when a modal menu mounts already open", async () => {
  await click(q.button("Add modal item"));

  expect(q.menu()).toBeVisible();
  expect(q.menu()).toHaveFocus();
  expect(q.menuitem("Rename")).not.toHaveAttribute("data-active-item");
});

// Whether an item stays highlighted while focus is declined is deliberately not
// pinned here, because nothing has decided that yet.
// https://github.com/ariakit/ariakit/issues/2946
test("leaves focus alone when the menu opts out", async () => {
  const add = q.button("Add quiet item");
  await click(add);

  expect(q.menu()).toBeVisible();
  // `click` already settles the dialog's focus effect and microtask, so focus
  // has had its chance to move by now.
  expect(add).toHaveFocus();
});
