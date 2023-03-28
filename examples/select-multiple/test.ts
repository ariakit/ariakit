import { click, getByRole, press, queryByRole, type } from "@ariakit/test";

const getSelect = () => getByRole("combobox", { name: "Favorite food" });
const getList = () => queryByRole("listbox");
const getOption = (name: string) => getByRole("option", { name });

test("default value", () => {
  expect(getSelect()).toHaveTextContent("2 food selected");
});

test("show/hide on click", async () => {
  expect(getList()).not.toBeInTheDocument();
  await click(getSelect());
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Cake")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Cake")).toHaveAttribute("aria-selected", "true");
  await click(getSelect());
  expect(getList()).not.toBeInTheDocument();
  expect(getSelect()).toHaveFocus();
  expect(getSelect()).toHaveTextContent("2 food selected");
});

test("show/hide on enter", async () => {
  expect(getList()).not.toBeInTheDocument();
  await press.Tab();
  await press.Enter();
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Cake")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Cake")).toHaveAttribute("aria-selected", "true");
  await press.ShiftTab();
  expect(getList()).toBeVisible();
  await press.Enter();
  expect(getList()).not.toBeInTheDocument();
  expect(getSelect()).toHaveFocus();
});

test("show/hide on space", async () => {
  expect(getList()).not.toBeInTheDocument();
  await press.Tab();
  await press.Space();
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Cake")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Cake")).toHaveAttribute("aria-selected", "true");
  await press.ShiftTab();
  expect(getList()).toBeVisible();
  await press.Space();
  expect(getList()).not.toBeInTheDocument();
  expect(getSelect()).toHaveFocus();
});

test("select with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(getOption("Cake")).toHaveFocus();
  await type("cccc");
  expect(getOption("Chocolate")).toHaveFocus();
  await press.Enter();
  expect(getOption("Chocolate")).toHaveAttribute("aria-selected", "true");
  expect(getSelect()).toHaveTextContent("3 food selected");
  await press.ArrowDown();
  await press.Escape();
  expect(getList()).not.toBeInTheDocument();
  expect(getSelect()).toHaveFocus();
  expect(getSelect()).toHaveTextContent("3 food selected");
  await press.ArrowUp();
  expect(getOption("Chocolate")).toHaveFocus();
  await press.Space();
  expect(getSelect()).toHaveTextContent("2 food selected");
  await type("br");
  expect(getOption("Broccoli")).toHaveFocus();
});

test("select on click", async () => {
  await click(getSelect());
  await click(getOption("Chocolate"));
  expect(getOption("Chocolate")).toHaveAttribute("aria-selected", "true");
  expect(getSelect()).toHaveTextContent("3 food selected");
  await click(getOption("Chocolate"));
  expect(getOption("Chocolate")).toHaveAttribute("aria-selected", "false");
  expect(getSelect()).toHaveTextContent("2 food selected");
  await click(getOption("Cake"));
  expect(getOption("Cake")).toHaveAttribute("aria-selected", "false");
  expect(getSelect()).toHaveTextContent("Apple");
});
