import {
  click,
  getAllByRole,
  getByRole,
  getByText,
  press,
  type,
} from "@ariakit/test";
import list from "./list.js";

test("show entire list", async () => {
  await click(getByRole("combobox"));
  expect(getByRole("listbox")).toBeVisible();
  expect(getAllByRole("option")).toHaveLength(list.length);
});

test("filter list", async () => {
  await press.Tab();
  await type("sa");
  expect(getAllByRole("option")).toHaveLength(5);
  await press.ArrowDown();
  expect(getByRole("option", { name: "Salad" })).toHaveFocus();
  await press.ArrowDown();
  expect(getByRole("option", { name: "Sandwich" })).toHaveFocus();
});

test("no result", async () => {
  await press.Tab();
  await type("zzz");
  expect(getByText("No results found")).toBeVisible();
});
