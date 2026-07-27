import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("traps and releases focus in a region", async () => {
  const checkbox = q.checkbox("Trap region");
  await focus(q.text("Before region"));
  await press.Tab();
  expect(checkbox).toHaveFocus();
  await press.Space(checkbox);

  await press.Tab();
  expect(q.button("Region first")).toHaveFocus();
  await press.Tab();
  expect(q.button("Region second")).toHaveFocus();
  await press.Tab();
  expect(q.textbox("Region input")).toHaveFocus();
  await press.Tab();
  expect(checkbox).toHaveFocus();

  await press.Space(checkbox);
  await press.Tab();
  await press.Tab();
  await press.Tab();
  await press.Tab();
  expect(q.text("After region")).toHaveFocus();
});

test("traps and releases focus with standalone sentinels", async () => {
  const checkbox = q.checkbox("Trap standalone");
  await focus(q.text("Before standalone"));
  await press.Tab();
  expect(checkbox).toHaveFocus();

  await press.Tab();
  expect(q.button("Standalone button")).toHaveFocus();
  await press.Tab();
  expect(checkbox).toHaveFocus();
  await press.Tab();
  expect(q.button("Standalone button")).toHaveFocus();
  await press.ShiftTab();
  expect(checkbox).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("Standalone button")).toHaveFocus();

  await click(checkbox);
  await focus(q.button("Standalone button"));
  await press.Tab();
  expect(q.text("After standalone")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("Standalone button")).toHaveFocus();
  await press.ShiftTab();
  expect(checkbox).toHaveFocus();
  await press.ShiftTab();
  expect(q.text("Before standalone")).toHaveFocus();
});
