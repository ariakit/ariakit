import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7410
test("arrow keys open and close the menus of a vertical menubar", async () => {
  await press.Tab();
  expect(q.menuitem("File")).toHaveFocus();

  await press.ArrowRight();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("New")).toHaveFocus();

  await press.ArrowDown();
  expect(q.menuitem("Open")).toHaveFocus();
  await press.ArrowUp();
  expect(q.menuitem("New")).toHaveFocus();

  await press.ArrowLeft();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveAttribute("aria-expanded", "false");
  expect(q.menuitem("File")).toHaveFocus();

  await press.ArrowDown();
  expect(q.menuitem("Edit")).toHaveFocus();
  expect(q.menuitem("Edit")).toHaveAttribute("aria-expanded", "false");
  expect(q.menu.maybe("Edit")).not.toBeInTheDocument();

  await press.ArrowUp();
  expect(q.menuitem("File")).toHaveFocus();
  expect(q.menuitem("File")).toHaveAttribute("aria-expanded", "false");
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
});
