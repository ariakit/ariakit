import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";
import "../combobox-multiple/test.ts";

// https://github.com/ariakit/ariakit/issues/6848
test("click on listbox then move through items with keyboard", async () => {
  await click(q.combobox());
  expect(q.combobox()).toHaveFocus();
  await click(q.listbox());
  expect(q.combobox()).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.combobox()).toHaveFocus();
});

test("tabs past a popover rendered as a list", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveAttribute("tabindex", "-1");

  await press.Tab();
  expect(q.button("After combobox")).toHaveFocus();
});
