import { getByRole, press, render } from "ariakit-test";
import Example from ".";

test("show focus-within styles", async () => {
  render(
    <>
      <Example />
      <button>External button</button>
    </>
  );
  expect(getByRole("group")).not.toHaveClass("focus-within");
  await press.Tab();
  expect(getByRole("group")).toHaveClass("focus-within");
  await press.Tab();
  expect(getByRole("group")).not.toHaveClass("focus-within");
  await press.ShiftTab();
  expect(getByRole("group")).toHaveClass("focus-within");
  await press.Enter();
  await press.Tab();
  expect(getByRole("group")).not.toHaveClass("focus-within");
});
