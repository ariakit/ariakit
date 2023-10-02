import { click, press, q, type } from "@ariakit/test";

test("default value", () => {
  expect(q.combobox("Favorite food")).toHaveTextContent("2 food selected");
});

test("show/hide on click", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox("Favorite food"));
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Cake")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Cake")).toHaveAttribute("aria-selected", "true");
  await click(q.combobox("Favorite food"));
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Favorite food")).toHaveFocus();
  expect(q.combobox("Favorite food")).toHaveTextContent("2 food selected");
});

test("show/hide on enter", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await press.Tab();
  await press.Enter();
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Cake")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Cake")).toHaveAttribute("aria-selected", "true");
  await press.ShiftTab();
  expect(q.listbox()).toBeVisible();
  await press.Enter();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Favorite food")).toHaveFocus();
});

test("show/hide on space", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await press.Tab();
  await press.Space();
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Cake")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Cake")).toHaveAttribute("aria-selected", "true");
  await press.ShiftTab();
  expect(q.listbox()).toBeVisible();
  await press.Space();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Favorite food")).toHaveFocus();
});

test("select with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.option("Cake")).toHaveFocus();
  await type("cccc");
  expect(q.option("Chocolate")).toHaveFocus();
  await press.Enter();
  expect(q.option("Chocolate")).toHaveAttribute("aria-selected", "true");
  expect(q.combobox("Favorite food")).toHaveTextContent("3 food selected");
  await press.ArrowDown();
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Favorite food")).toHaveFocus();
  expect(q.combobox("Favorite food")).toHaveTextContent("3 food selected");
  await press.ArrowUp();
  expect(q.option("Chocolate")).toHaveFocus();
  await press.Space();
  expect(q.combobox("Favorite food")).toHaveTextContent("2 food selected");
  await type("br");
  expect(q.option("Broccoli")).toHaveFocus();
});

test("select on click", async () => {
  await click(q.combobox("Favorite food"));
  await click(q.option("Chocolate"));
  expect(q.option("Chocolate")).toHaveAttribute("aria-selected", "true");
  expect(q.combobox("Favorite food")).toHaveTextContent("3 food selected");
  await click(q.option("Chocolate"));
  expect(q.option("Chocolate")).toHaveAttribute("aria-selected", "false");
  expect(q.combobox("Favorite food")).toHaveTextContent("2 food selected");
  await click(q.option("Cake"));
  expect(q.option("Cake")).toHaveAttribute("aria-selected", "false");
  expect(q.combobox("Favorite food")).toHaveTextContent("Apple");
});
