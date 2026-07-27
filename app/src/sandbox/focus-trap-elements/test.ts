import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("focus trap elements participate in tab order", async () => {
  const group = q.within(q.group("trap"));
  await focus(group.text("Start"));
  await press.Tab();
  expect(group.text("Before")).toHaveFocus();
  await press.Tab();
  expect(group.text("Trap")).toHaveFocus();
  await press.Tab();
  expect(group.text("After")).toHaveFocus();
});

test("focus trap elements can redirect focus", async () => {
  const group = q.within(q.group("redirect"));
  await focus(group.text("Start"));
  await press.Tab();
  expect(group.text("Before")).toHaveFocus();
  await press.Tab();
  expect(group.text("Focus target")).toHaveFocus();
  await press.ShiftTab();
  expect(group.text("Skip")).toHaveFocus();
  await press.ShiftTab();
  expect(group.text("Focus target")).toHaveFocus();
});
