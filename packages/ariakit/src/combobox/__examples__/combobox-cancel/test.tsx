import { click, getByRole, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getCombobox = () => getByRole("combobox");
const getCancelButton = () => getByRole("button", { name: "Clear input" });
const getOption = (name: string) => getByRole("option", { name });
const expectComboboxClearedAndFocused = () => {
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
};
const selectAnOption = async () => {
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("Apple"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
};

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("clear input with mouse", async () => {
  render(<Example />);
  await selectAnOption();
  await click(getCancelButton());
  expectComboboxClearedAndFocused();
});

test("clear input with keyboard (tab + enter)", async () => {
  render(<Example />);
  await selectAnOption();
  await press.Tab();
  await press.Enter();
  expectComboboxClearedAndFocused();
});

test("clear input with keyboard (tab + space)", async () => {
  render(<Example />);
  await selectAnOption();
  await press.Tab();
  await press.Space();
  expectComboboxClearedAndFocused();
});
