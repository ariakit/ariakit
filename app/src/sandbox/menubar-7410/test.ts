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

// https://github.com/ariakit/ariakit/issues/7410
test("submenus keep following their parent menu", async () => {
  await press.Tab();
  await press.ArrowRight();
  expect(q.menuitem("New")).toHaveFocus();

  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.menuitem("Share")).toHaveFocus();

  await press.ArrowRight();
  expect(q.menu("Share")).toBeVisible();
  expect(q.menuitem("Email")).toHaveFocus();

  await press.ArrowLeft();
  expect(q.menu.maybe("Share")).not.toBeInTheDocument();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("Share")).toHaveFocus();

  await press.ArrowLeft();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7410
test("an explicit placement wins in a right-to-left menubar", async () => {
  await press.Tab();
  await press.Tab();
  expect(q.menuitem("Insert")).toHaveFocus();

  await press.ArrowLeft();
  expect(q.menu("Insert")).toBeVisible();
  expect(q.menuitem("Image")).toHaveFocus();

  await press.ArrowRight();
  expect(q.menu.maybe("Insert")).not.toBeInTheDocument();
  expect(q.menuitem("Insert")).toHaveFocus();

  await press.ArrowDown();
  expect(q.menuitem("Format")).toHaveFocus();
  expect(q.menu.maybe("Format")).not.toBeInTheDocument();
});
