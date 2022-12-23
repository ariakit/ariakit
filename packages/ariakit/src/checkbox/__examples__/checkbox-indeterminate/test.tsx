import { click, getByLabelText, press, render } from "ariakit-test";
import Example from ".";

test("check/uncheck on click", async () => {
  render(<Example />);
  expect(getByLabelText("Apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Mango")).toHaveAttribute("aria-checked", "false");

  await click(getByLabelText("Apple"));
  expect(getByLabelText("Apple")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("Orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Mango")).toHaveAttribute("aria-checked", "false");

  await click(getByLabelText("Apple"));
  await click(getByLabelText("Mango"));
  expect(getByLabelText("Apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Mango")).toHaveAttribute("aria-checked", "true");
});

test("space", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByLabelText("Fruits")).toHaveFocus();
  expect(getByLabelText("Fruits")).not.toBeChecked();

  await press.Space();
  expect(getByLabelText("Fruits")).toHaveFocus();
  expect(getByLabelText("Fruits")).toBeChecked();
  expect(getByLabelText("Apple")).toBeChecked();
  expect(getByLabelText("Orange")).toBeChecked();
  expect(getByLabelText("Mango")).toBeChecked();

  await press.Space();
  expect(getByLabelText("Fruits")).not.toBeChecked();
  expect(getByLabelText("Apple")).not.toBeChecked();
  expect(getByLabelText("Orange")).not.toBeChecked();
  expect(getByLabelText("Mango")).not.toBeChecked();

  await press.Tab();
  expect(getByLabelText("Apple")).toHaveFocus();
  expect(getByLabelText("Apple")).not.toBeChecked();

  await press.Space();
  expect(getByLabelText("Apple")).toHaveFocus();
  expect(getByLabelText("Apple")).toBeChecked();
  expect(getByLabelText("Fruits")).toHaveAttribute("aria-checked", "mixed");
  expect(getByLabelText("Fruits")).not.toBeChecked();

  await press.Tab();
  await press.Space();
  expect(getByLabelText("Apple")).not.toHaveFocus();
  expect(getByLabelText("Orange")).toHaveFocus();
  expect(getByLabelText("Apple")).toBeChecked();
  expect(getByLabelText("Fruits")).toHaveAttribute("aria-checked", "mixed");
  expect(getByLabelText("Fruits")).not.toBeChecked();

  await press.Tab();
  await press.Space();
  expect(getByLabelText("Orange")).not.toHaveFocus();
  expect(getByLabelText("Mango")).toHaveFocus();
  expect(getByLabelText("Apple")).toBeChecked();
  expect(getByLabelText("Mango")).toBeChecked();
  expect(getByLabelText("Fruits")).toBeChecked();
});
