import {
  click,
  getByLabelText,
  getByRole,
  getByText,
  press,
  render,
} from "ariakit-test";
import Example from ".";

test("correctly traps focus", async () => {
  // Focus trap is on by default in the Example
  render(
    <div>
      <div tabIndex={0}>Before</div>
      <Example />
      <div tabIndex={0}>After</div>
    </div>
  );
  await press.Tab();
  expect(getByText("Before")).toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
  await press.Tab();
  expect(getByText("After")).not.toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
  await press.ShiftTab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.ShiftTab();
  expect(getByText("Before")).not.toHaveFocus();
});

test("correctly releases focus", async () => {
  // Focus trap is on by default in the Example
  render(
    <div>
      <div tabIndex={0}>Before</div>
      <Example />
      <div tabIndex={0}>After</div>
    </div>
  );
  // First, disabling focus trap
  await click(getByLabelText("Trap focus"));
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
  await press.Tab();
  expect(getByText("After")).toHaveFocus();
  await press.ShiftTab();
  expect(getByRole("button")).toHaveFocus();
  await press.ShiftTab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.ShiftTab();
  expect(getByText("Before")).toHaveFocus();
});
