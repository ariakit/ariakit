import { getByRole, press, render, type } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

const getCombobox = () => getByRole("combobox");
const getPopover = () => getByRole("listbox", { hidden: true });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("autocomplete on arrow down key", async () => {
  render(<Example />);
  const combobox = getCombobox();
  const popover = getPopover();
  await press.Tab();
  expect(popover).not.toBeVisible();
  expect(combobox).toHaveFocus();
  await type("a");
  expect(popover).toBeVisible();
  await press.ArrowDown();
  expect(combobox).toHaveValue("Apple");
});

test("autocomplete on arrow up key", async () => {
  render(<Example />);
  const combobox = getCombobox();
  const popover = getPopover();
  await press.Tab();
  expect(popover).not.toBeVisible();
  expect(combobox).toHaveFocus();
  await type("w");
  expect(popover).toBeVisible();
  await press.ArrowUp();
  expect(combobox).toHaveValue("Watermelon");
});
