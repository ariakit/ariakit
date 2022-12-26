import { getByRole, press, render } from "ariakit-test";
import Example from ".";

const getItem = (name: string) => getByRole("button", { name });

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
