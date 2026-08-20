import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("show multiple notifications", async () => {
  expect(q.alert.all()).toHaveLength(0);
  await click(q.button("Say Hello"));
  expect(q.alert.all()).toHaveLength(1);
  await click(q.button("Say Hello"));
  expect(q.alert.all()).toHaveLength(2);
});

test("notifications remain interactive while the dialog is modal", async () => {
  await click(q.button("Say Hello"));
  await click(q.button("Show modal"));
  expect(q.dialog("Notification")).toBeVisible();
  expect(q.alert.all()).toHaveLength(1);
  expect(q.button("Say Hello")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("close")).toHaveFocus();
  await press.Enter();
  expect(q.alert.all()).toHaveLength(0);
  expect(q.dialog("Notification")).toBeVisible();
  await press.Escape();
  expect(q.dialog.maybe("Notification")).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});
