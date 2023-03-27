import { click, getByRole, getByText, press, type } from "@ariakit/test";

const getCombobox = () => getByRole("combobox");
const getPopover = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) => getByRole("option", { name });

test("show on click", async () => {
  expect(getPopover()).not.toBeVisible();
  await click(getCombobox());
  expect(getPopover()).toBeVisible();
  expect(getOption("🍎 Apple")).not.toHaveFocus();
});

test("label click", async () => {
  expect(getPopover()).not.toBeVisible();
  await click(getByText("Your favorite fruit"));
  expect(getPopover()).not.toBeVisible();
});

test("show on arrow down key", async () => {
  await press.Tab();
  expect(getPopover()).not.toBeVisible();
  await press.ArrowDown();
  expect(getPopover()).toBeVisible();
  expect(getOption("🍎 Apple")).not.toHaveFocus();
});

test("show on arrow up key", async () => {
  await press.Tab();
  expect(getPopover()).not.toBeVisible();
  await press.ArrowUp();
  expect(getPopover()).toBeVisible();
  expect(getOption("🍉 Watermelon")).not.toHaveFocus();
});

test("show on change", async () => {
  await press.Tab();
  expect(getPopover()).not.toBeVisible();
  await type("a");
  expect(getPopover()).toBeVisible();
  expect(getOption("🍎 Apple")).not.toHaveFocus();
});

test("navigate through items with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getOption("🍎 Apple")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("🍇 Grape")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("🍊 Orange")).toHaveFocus();
});

test("type", async () => {
  await press.Tab();
  await type("a");
  await press.ArrowDown();
  expect(getOption("🍎 Apple")).toHaveFocus();
  await press.ArrowLeft();
  expect(getOption("🍎 Apple")).toHaveFocus();
  await type("b");
  expect(getCombobox()).toHaveValue("ba");
  expect(getOption("🍉 Watermelon")).not.toHaveFocus();
});

test("set value and hide on item click with mouse", async () => {
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("🍊 Orange"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Orange");
  expect(getPopover()).not.toBeVisible();
});

test("set value and hide on item click with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("");
  await press.Enter();
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Grape");
  expect(getPopover()).not.toBeVisible();
});

test("do not set value and hide by pressing space", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("");
  await type(" ");
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue(" ");
  expect(getOption("🍊 Orange")).not.toHaveFocus();
  expect(getPopover()).toBeVisible();
});

test("hide listbox by pressing escape", async () => {
  await click(getCombobox());
  expect(getPopover()).toBeVisible();
  await press.Escape();
  expect(getPopover()).not.toBeVisible();
  expect(getCombobox()).toHaveFocus();
});

test("hide listbox by clicking outside", async () => {
  await click(getCombobox());
  expect(getPopover()).toBeVisible();
  await click(document.body);
  expect(getPopover()).not.toBeVisible();
  expect(getCombobox()).not.toHaveFocus();
});

test("re-open listbox when deleting content", async () => {
  await press.Tab();
  await type("a");
  expect(getPopover()).toBeVisible();
  await press.Escape();
  expect(getPopover()).not.toBeVisible();
  await type("\b");
  expect(getPopover()).toBeVisible();
});

test("clicking on combobox input removes focus from item", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getOption("🍇 Grape")).toHaveFocus();
  await click(getCombobox());
  expect(getOption("🍇 Grape")).not.toHaveFocus();
});
