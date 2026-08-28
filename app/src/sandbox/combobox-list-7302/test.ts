import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7302
test("nested tree list owns the popup role", async () => {
  const combobox = q.combobox("Go to file");
  await click(combobox);

  const popover = q.dialog("Go to file results");
  // ComboboxList resolves the popup role asynchronously, so aria-haspopup can
  // still be catching up when the popover opens.
  await expect
    .poll(() => combobox.getAttribute("aria-haspopup"))
    .toBe("dialog");

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
  await expect
    .poll(() => combobox.getAttribute("aria-haspopup"))
    .toBe("dialog");

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
