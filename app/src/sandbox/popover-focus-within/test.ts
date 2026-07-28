import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("tracks focus within the popover trigger group", async () => {
  expect(q.group()).not.toHaveClass("focus-within");
  await press.Tab();
  expect(q.group()).toHaveClass("focus-within");
  await press.Tab();
  expect(q.group()).not.toHaveClass("focus-within");
  await press.ShiftTab();
  expect(q.group()).toHaveClass("focus-within");

  await press.Enter();
  expect(q.button("Accept")).toHaveFocus();
  await press.Tab();
  expect(q.button("External button")).toHaveFocus();
  expect(q.group()).not.toHaveClass("focus-within");
});
