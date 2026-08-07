import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// menu-conditional-mount covers the modal, opt-out, and mount-after-load
// openings, which need a page where nothing is open yet.

// https://github.com/ariakit/ariakit/issues/2946
test("takes focus when the menu starts open", async () => {
  await expect.poll(q.menu.lazy()).toBeVisible();

  expect(q.menu()).toHaveFocus();
  expect(q.menuitem("Rename")).not.toHaveAttribute("data-active-item");
});

// The menu is only usable if the composite can still start roving from the
// container it just focused.
// https://github.com/ariakit/ariakit/issues/2946
test("navigates from the container when the menu starts open", async () => {
  await expect.poll(q.menu.lazy()).toBeVisible();
  expect(q.menu()).toHaveFocus();

  await press.ArrowDown();

  expect(q.menuitem("Rename")).toHaveFocus();
});
