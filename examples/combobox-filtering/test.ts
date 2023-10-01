import { click, press, q, type } from "@ariakit/test";
import list from "./list.js";

test("show entire list", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  expect(q.option.all()).toHaveLength(list.length);
});

test("filter list", async () => {
  await press.Tab();
  await type("sa");
  expect(q.option.all()).toHaveLength(5);
  await press.ArrowDown();
  expect(q.option("Salad")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Sandwich")).toHaveFocus();
});

test("no result", async () => {
  await press.Tab();
  await type("zzz");
  expect(q.text("No results found")).toBeVisible();
});
