import { getByRole, press } from "@ariakit/test";

test("show focus-within styles", async () => {
  expect(getByRole("group")).not.toHaveClass("focus-within");
  await press.Tab();
  expect(getByRole("group")).toHaveClass("focus-within");
  await press.Tab();
  expect(getByRole("group")).not.toHaveClass("focus-within");
  await press.ShiftTab();
  expect(getByRole("group")).toHaveClass("focus-within");
  await press.Enter();
  await press.Tab();
  expect(getByRole("button", { name: "External button" })).toHaveFocus();
  expect(getByRole("group")).not.toHaveClass("focus-within");
});
