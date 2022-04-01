import { click, getByRole, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getCombobox = () => getByRole("combobox");

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("clear result", async () => {
  render(<Example />);
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getByRole("option", { name: "Apple" }));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
  await click(getByRole("button"));
  expect(getCombobox()).toHaveValue("");
});
