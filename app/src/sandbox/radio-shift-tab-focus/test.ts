import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("Shift+Tab moves focus back to the checked radio", async () => {
  const option1 = q.radio("Option 1");
  const option2 = q.radio("Option 2");
  const option3 = q.radio.ensure("Option 3");

  await press.Tab();
  expect(option1).toHaveFocus();

  await press.ArrowRight();
  expect(option2).toHaveFocus();
  expect(option2).toBeChecked();

  option3.focus();
  expect(option3).toHaveFocus();
  expect(option3).not.toBeChecked();
  expect(option2).toBeChecked();

  await press.Tab();
  expect(q.button("After")).toHaveFocus();

  await press.ShiftTab();
  expect(option2).toHaveFocus();
  expect(option2).toBeChecked();
  expect(option3).not.toBeChecked();
});
