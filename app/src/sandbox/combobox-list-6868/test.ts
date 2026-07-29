import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6868
test("tabs to a non-scrollable list and moves focus with ArrowDown", async () => {
  await click(q.combobox.ensure("Favorite fruit"));
  expect(q.combobox("Search fruits")).toHaveFocus();

  await press.Tab();
  expect(q.button("Review options")).toHaveFocus();

  await press.Tab();
  expect(q.listbox("Favorite fruit")).toHaveFocus();
  expect(q.status("Composite base element")).toHaveTextContent("combobox");

  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
});
