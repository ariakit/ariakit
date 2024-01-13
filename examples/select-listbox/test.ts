import { press, q } from "@ariakit/test";

test("tab to listbox", async () => {
  expect(q.listbox()).not.toHaveFocus();
  await press.Tab();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).not.toHaveFocus();
});

test("move through items with arrow keys", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("data-active-item", "true");
  expect(q.option("Apple")).toHaveAttribute("data-focus-visible", "true");
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  await press.ArrowDown();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Banana")).toHaveFocus();
  expect(q.option("Banana")).toHaveAttribute("data-active-item", "true");
  expect(q.option("Banana")).toHaveAttribute("data-focus-visible", "true");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
});

test("select item with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Orange")).toHaveFocus();
  expect(q.option("Orange")).toHaveAttribute("data-active-item", "true");
  expect(q.option("Orange")).toHaveAttribute("data-focus-visible", "true");
  expect(q.option("Orange")).toHaveAttribute("aria-selected", "true");
  await press.Home();
  await press.Space();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("data-active-item", "true");
  expect(q.option("Apple")).toHaveAttribute("data-focus-visible", "true");
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
});
