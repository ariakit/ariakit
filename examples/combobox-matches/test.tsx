import {
  click,
  getAllByRole,
  getByRole,
  getByText,
  press,
  render,
  type,
} from "@ariakit/test";
import list from "./list";
import Example from ".";

test("show entire list", async () => {
  render(<Example />);
  await click(getByRole("combobox"));
  expect(getByRole("listbox")).toBeVisible();
  expect(getAllByRole("option")).toHaveLength(list.length);
});

test("filter list", async () => {
  render(<Example />);
  await press.Tab();
  await type("sa");
  expect(getAllByRole("option")).toHaveLength(5);
  await press.ArrowDown();
  expect(getByRole("option", { name: "Salad" })).toHaveFocus();
  await press.ArrowDown();
  expect(getByRole("option", { name: "Sandwich" })).toHaveFocus();
});

test("no result", async () => {
  render(<Example />);
  await press.Tab();
  await type("zzz");
  expect(getByText("No results found")).toBeVisible();
});
