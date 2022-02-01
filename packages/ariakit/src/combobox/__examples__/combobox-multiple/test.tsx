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

const getInput = () => getByRole("combobox", { name: "Your favorite food" });
const getOption = (name: string) => getByRole("option", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("default checked", async () => {
  render(<Example />);
  await click(getInput());
  expect(getOption("Bacon")).toHaveAttribute("aria-selected", "true");
});

test("check/uncheck with click", async () => {
  render(<Example />);
  await click(getInput());
  await click(getOption("Burger"));
  await click(getOption("Banana"));
  expect(getOption("Burger")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "true");
  await click(getOption("Burger"));
  expect(getOption("Burger")).toHaveAttribute("aria-selected", "false");
  await click(getOption("Banana"));
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
});

test("check/uncheck with enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
  await press.Enter();
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "true");
  await press.Enter();
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
});

test("no result", async () => {
  render(<Example />);
  await press.Tab();
  await type("zzz");
  expect(getByText("No results found")).toBeVisible();
});
