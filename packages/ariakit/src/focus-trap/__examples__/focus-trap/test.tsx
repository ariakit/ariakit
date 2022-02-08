import {
  click,
  focus,
  getByLabelText,
  getByRole,
  getByText,
  press,
  render,
} from "ariakit-test-utils";
import Example from ".";

test("correctly traps focus", async () => {
  // Focus trap is on by default in the Example
  render(
    <div>
      <Example />
      <div tabIndex={0}>Outside</div>
    </div>
  );
  focus(getByRole("checkbox"));
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  expect(getByText("Outside")).not.toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
});

test("correctly releases focus", async () => {
  // Focus trap is on by default in the Example
  render(
    <div>
      <Example />
      <div tabIndex={0}>Outside</div>
    </div>
  );
  // Disabling focus trap
  await click(getByLabelText("Trap focus"));
  await focus(getByRole("button"));
  await press.Tab();
  expect(getByRole("checkbox")).not.toHaveFocus();
  expect(getByRole("button")).not.toHaveFocus();
  expect(getByText("Outside")).toHaveFocus();
});
