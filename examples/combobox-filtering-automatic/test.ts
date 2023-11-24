import { click, hover, press, q, type } from "@ariakit/test";

test("show/hide popover with click", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  expect(q.option("Apple")).not.toHaveFocus();
  await click(document.body);
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).not.toHaveFocus();
});

test("show/hide popover with keyboard", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(q.listbox()).toBeVisible();
  expect(q.option("Apple")).not.toHaveFocus();
  await press.PageDown();
  expect(q.option("Yogurt")).toHaveFocus();
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
});

test("hover over items", async () => {
  await click(q.combobox());
  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveFocus();
  await hover(q.option("Burger"));
  expect(q.option("Burger")).toHaveFocus();
  await hover(document.body);
  expect(q.option("Burger")).toHaveFocus();
  await press.ArrowUp();
  expect(q.option("Broccoli")).toHaveFocus();
});

test("filter items", async () => {
  await press.Tab();
  await type("gr");
  expect(q.option.all()).toHaveLength(3);
  expect(q.option("Burger")).toHaveFocus();
  expect(q.option("Grapes")).toBeVisible();
  expect(q.option("Yogurt")).toBeVisible();
  await type("q");
  expect(q.option.all()).toHaveLength(0);
  expect(q.text("No results found")).toBeVisible();
});
