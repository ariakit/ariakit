import { click, press, q, type } from "@ariakit/test";

test("show on click", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  expect(q.option("🍎 Apple")).not.toHaveFocus();
});

test("label click", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.text("Your favorite fruit"));
  expect(q.listbox()).not.toBeInTheDocument();
});

test("show on arrow down key", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(q.listbox()).toBeVisible();
  expect(q.option("🍎 Apple")).not.toHaveFocus();
});

test("show on arrow up key", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  await press.ArrowUp();
  expect(q.listbox()).toBeVisible();
  expect(q.option("🍉 Watermelon")).not.toHaveFocus();
});

test("show on change", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  await type("a");
  expect(q.listbox()).toBeVisible();
  expect(q.option("🍎 Apple")).not.toHaveFocus();
});

test("navigate through items with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option("🍎 Apple")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("🍇 Grape")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("🍊 Orange")).toHaveFocus();
});

test("type", async () => {
  await press.Tab();
  await type("a");
  await press.ArrowDown();
  expect(q.option("🍎 Apple")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.option("🍎 Apple")).toHaveFocus();
  await type("b");
  expect(q.combobox()).toHaveValue("ba");
  expect(q.option("🍉 Watermelon")).not.toHaveFocus();
});

test("set value and hide on item click with mouse", async () => {
  await click(q.combobox());
  expect(q.combobox()).toHaveValue("");
  await click(q.option("🍊 Orange"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveValue("Orange");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("set value and hide on item click with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("");
  await press.Enter();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveValue("Grape");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("do not set value and hide by pressing space", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("");
  await type(" ");
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveValue(" ");
  expect(q.option("🍊 Orange")).not.toHaveFocus();
  expect(q.listbox()).toBeVisible();
});

test("hide listbox by pressing escape", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
});

test("hide listbox by clicking outside", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  await click(document.body);
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).not.toHaveFocus();
});

test("re-open listbox when deleting content", async () => {
  await press.Tab();
  await type("a");
  expect(q.listbox()).toBeVisible();
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  await type("\b");
  expect(q.listbox()).toBeVisible();
});

test("clicking on combobox input removes focus from item", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option("🍇 Grape")).toHaveFocus();
  await click(q.combobox());
  expect(q.option("🍇 Grape")).not.toHaveFocus();
});
