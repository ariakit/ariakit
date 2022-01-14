import {
  click,
  getByRole,
  getByText,
  press,
  render,
  type,
} from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getOption = (name: string) => getByRole("option", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("default checked", async () => {
  render(<Example />);
  await click(getByRole("combobox"));
  expect(getOption("Apple")).toBeChecked();
});

test("check/uncheck with click", async () => {
  render(<Example />);
  await click(getByRole("combobox"));
  await click(getOption("Burger"));
  await click(getOption("Banana"));
  expect(getOption("Burger")).toBeChecked();
  expect(getOption("Banana")).toBeChecked();
  await click(getOption("Burger"));
  expect(getOption("Burger")).not.toBeChecked();
  await click(getOption("Banana"));
  expect(getOption("Banana")).not.toBeChecked();
});

test("check/uncheck with enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getOption("Bacon")).not.toBeChecked();
  await press.Enter();
  expect(getOption("Bacon")).toBeChecked();
  await press.Enter();
  expect(getOption("Bacon")).not.toBeChecked();
});

test("no result", async () => {
  render(<Example />);
  await press.Tab();
  await type("zzz");
  expect(getByText("No results found")).toBeVisible();
});
