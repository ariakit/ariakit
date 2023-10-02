import { press, q } from "@ariakit/test";

test("show focus-within styles", async () => {
  expect(q.group()).not.toHaveClass("focus-within");
  await press.Tab();
  expect(q.group()).toHaveClass("focus-within");
  await press.Tab();
  expect(q.group()).not.toHaveClass("focus-within");
  await press.ShiftTab();
  expect(q.group()).toHaveClass("focus-within");
  await press.Enter();
  await press.Tab();
  expect(q.button("External button")).toHaveFocus();
  expect(q.group()).not.toHaveClass("focus-within");
});
