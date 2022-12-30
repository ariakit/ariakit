import { getByRole, press, render } from "ariakit-test";
import Example from ".";

const getPopover = () => getByRole("dialog", { hidden: true });

const getDisclosure = () => getByRole("button", { name: "Open" });
test("navigation when using keyboard on a popover with portal", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(getPopover()).toBeVisible();
  expect(getDisclosure()).not.toHaveFocus();
  await press.ShiftTab();
  expect(getDisclosure()).toHaveFocus();
  await press.Tab();
  expect(getDisclosure()).not.toHaveFocus();
});
