import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7302
test("nested tree list owns the popup role", async () => {
  const combobox = q.combobox("Go to file");
  await click(combobox);

  const popover = q.dialog("Go to file results");
  expect(combobox).toHaveAttribute("aria-haspopup", "dialog");

  const tree = q.tree("Files");
  expect(popover).toContainElement(tree);
  expect(q.within(tree).treeitem.all()).toHaveLength(4);
  expect(q.within(popover).status()).toHaveTextContent("4 of 4 files");

  // The nested list re-renders on every keystroke, so the popup role must
  // survive both a filtered and an empty result set.
  await type("app", combobox);
  expect(q.dialog("Go to file results")).toBe(popover);
  expect(combobox).toHaveAttribute("aria-haspopup", "dialog");
  expect(q.within(popover).status()).toHaveTextContent("1 of 4 files");
  expect(q.within(tree).treeitem.all()).toHaveLength(1);

  await type("zzz", combobox);
  expect(q.dialog("Go to file results")).toBe(popover);
  expect(combobox).toHaveAttribute("aria-haspopup", "dialog");
  expect(q.within(popover).status()).toHaveTextContent("0 of 4 files");
  expect(q.within(tree).treeitem.all()).toHaveLength(0);
});

// https://github.com/ariakit/ariakit/issues/7302
test("nested menu list owns the popup role", async () => {
  const combobox = q.combobox("Run command");
  await click(combobox);

  const popover = q.dialog("Command results");
  expect(combobox).toHaveAttribute("aria-haspopup", "dialog");

  const menu = q.menu("Commands");
  expect(popover).toContainElement(menu);
  expect(q.within(menu).menuitem.all()).toHaveLength(3);
});

// https://github.com/ariakit/ariakit/issues/7302
test("unrelated listbox does not take the popup role", async () => {
  const combobox = q.combobox("Search fruits");
  await click(combobox);

  const popover = q.listbox("Fruit results");
  expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
  expect(popover).toContainElement(q.option("Apple"));
  expect(popover).toContainElement(q.listbox("Recently used"));
});

// https://github.com/ariakit/ariakit/issues/7302
test("popover sharing an element with a list keeps the popup role", async () => {
  const combobox = q.combobox("Search tags");
  await click(combobox);

  const popover = q.listbox("Tag results");
  expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
  expect(popover).toContainElement(q.option("Design"));
});

// https://github.com/ariakit/ariakit/issues/7302
test("nested list owns the popup role on a shared element", async () => {
  const combobox = q.combobox("Search issues");
  await click(combobox);

  const popover = q.dialog("Issue results");
  expect(combobox).toHaveAttribute("aria-haspopup", "dialog");

  const list = q.listbox("Issues");
  expect(popover).toContainElement(list);
  expect(list).toContainElement(q.option("Bug report"));
});

// https://github.com/ariakit/ariakit/issues/7302
// https://github.com/ariakit/ariakit/pull/7304#discussion_r3884213906
test("portaled list for the same store does not take the popup role", async () => {
  const combobox = q.combobox("Search docs");
  await click(combobox);

  const popover = q.listbox("Doc results");
  expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
  expect(popover).toContainElement(q.option("Getting started"));

  // The pinned list reaches this store through context, but it renders outside
  // the popup, so it must not take the popup role from it.
  const pinned = q.listbox("Pinned docs");
  expect(popover).not.toContainElement(pinned);
  expect(pinned).toContainElement(q.option("Changelog"));
});
