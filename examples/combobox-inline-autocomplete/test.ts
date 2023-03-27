import { click, getByRole, press, type } from "@ariakit/test";

const getCombobox = () => getByRole("combobox");
const getPopover = () => getByRole("listbox", { hidden: true });

test("autocomplete on arrow down key", async () => {
  await press.Tab();
  expect(getPopover()).not.toBeVisible();
  expect(getCombobox()).toHaveFocus();
  await type("a");
  expect(getPopover()).toBeVisible();
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("Apple");
});

test("autocomplete on arrow up key", async () => {
  await press.Tab();
  expect(getPopover()).not.toBeVisible();
  expect(getCombobox()).toHaveFocus();
  await type("w");
  expect(getPopover()).toBeVisible();
  await press.ArrowUp();
  expect(getCombobox()).toHaveValue("Watermelon");
});

test("clicking on combobox input makes the inline autocomplete the value", async () => {
  await press.Tab();
  await type("w");
  await press.ArrowUp();
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("Watermelon");
});
