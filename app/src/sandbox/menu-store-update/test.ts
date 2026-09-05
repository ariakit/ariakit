import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/7414#discussion_r3940621814
test("a placement written with setState survives a linked disclosure change", async () => {
  await click(q.button("Open beside"));
  await press.ShiftTab();
  expect(q.button("Actions")).toHaveFocus();

  await press.ArrowRight();
  expect(q.menu("Actions")).toBeVisible();
  expect(q.menuitem("Rename")).toHaveFocus();
  expect(q.text("First panel content")).toBeVisible();

  await press.Escape();
  expect(q.menu.maybe("Actions")).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();

  await click(q.button("Link to second panel"));
  await press.ShiftTab();
  await press.ShiftTab();
  expect(q.button("Actions")).toHaveFocus();

  await press.ArrowRight();
  expect(q.menu("Actions")).toBeVisible();
  expect(q.menuitem("Rename")).toHaveFocus();
  expect(q.text("Second panel content")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7414#discussion_r3940228527
test("a submenu follows a replaced parent store", async () => {
  await click(q.menuitem("Save"));
  await press.ArrowRight();
  expect(q.menuitem("Share")).toHaveFocus();

  await press.ArrowDown();
  expect(q.menu("Share")).toBeVisible();
  expect(q.menuitem("Email")).toHaveFocus();

  await press.Escape();
  expect(q.menu.maybe("Share")).not.toBeInTheDocument();
  expect(q.menuitem("Share")).toHaveFocus();

  await click(q.button("Show as sidebar"));
  await click(q.menuitem("Save"));
  await press.ArrowDown();
  expect(q.menuitem("Share")).toHaveFocus();

  await press.ArrowRight();
  expect(q.menu("Share")).toBeVisible();
  expect(q.menuitem("Email")).toHaveFocus();
});
