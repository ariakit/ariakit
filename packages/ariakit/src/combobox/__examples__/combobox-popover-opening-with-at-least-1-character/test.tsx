import { click, getByRole, press, render } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

const getCombobox = () => getByRole("combobox");
const getPopover = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) => getByRole("option", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("popover is not shown on click when combobox is pristine", async () => {
  render(<Example />);
  expect(getPopover()).not.toBeVisible();
  await click(getCombobox());
  expect(getPopover()).not.toBeVisible();
});

test("popover is not shown on arrow down key when combobox is pristine", async () => {
  render(<Example />);
  await press.Tab();
  expect(getPopover()).not.toBeVisible();
  await press.ArrowDown();
  expect(getPopover()).not.toBeVisible();
});

test("popover is shown on click when combobox is dirty", async () => {
  render(<Example defaultValue="a" />);
  expect(getPopover()).not.toBeVisible();
  await click(getCombobox());
  expect(getPopover()).toBeVisible();
  expect(getOption("🍎 Apple")).not.toHaveFocus();
});

test("popover is shown on arrow down key when combobox is dirty", async () => {
  render(<Example defaultValue="a" />);
  await press.Tab();
  expect(getPopover()).not.toBeVisible();
  await press.ArrowDown();
  expect(getPopover()).toBeVisible();
  expect(getOption("🍎 Apple")).not.toHaveFocus();
});
