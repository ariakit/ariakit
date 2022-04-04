import { getByRole, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getItem = (name: string) => getByRole("button", { name });

test("a11y", async () => {
  render(<Example />);
  expect(await axe(getByRole("toolbar"))).toHaveNoViolations();
});

test("navigate with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  expect(getItem("Undo")).toHaveFocus();
  await press.ArrowRight();
  expect(getItem("Bold")).toHaveFocus();
  await press.End();
  expect(getItem("Underline")).toHaveFocus();
  await press.Home();
  expect(getItem("Undo")).toHaveFocus();
  await press.ArrowDown();
  expect(getItem("Undo")).toHaveFocus();
  await press.ArrowUp();
  expect(getItem("Undo")).toHaveFocus();
});
