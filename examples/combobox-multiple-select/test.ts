import { click, press, q } from "@ariakit/test";
import "../combobox-multiple/test.js";

test("click on listbox then move through items with keyboard", async () => {
  await click(q.combobox());
  expect(q.combobox()).toHaveFocus();
  await click(q.listbox());
  expect(q.listbox()).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.combobox()).toHaveFocus();
});
