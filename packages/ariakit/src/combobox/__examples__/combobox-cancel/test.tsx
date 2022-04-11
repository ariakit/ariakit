import { click, getByRole, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getCombobox = () => getByRole("combobox");
const getCancelButton = () => getByRole("button", { name: "Clear input" });
const getOption = (name: string) => getByRole("option", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("clear input with mouse", async () => {
  render(<Example />);
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("Apple"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
  await click(getCancelButton());
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
});

test("clear input with keyboard (tab + enter)", async () => {
  render(<Example />);
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("Apple"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
  await press.Tab();
  await press.Enter();
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
});

test("clear input with keyboard (tab + space)", async () => {
  render(<Example />);
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("Apple"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
  await press.Tab();
  await press.Space();
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
});
