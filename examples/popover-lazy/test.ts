import { click, press, q, waitFor } from "@ariakit/test";
import { expect, test } from "vitest";

test("show/hide when clicking on disclosure", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.button("Accept invite"));
  await waitFor(() => expect(q.dialog()).toBeVisible());
  expect(q.button("Accept")).toHaveFocus();
  await click(q.button("Accept invite"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Accept invite")).toHaveFocus();
});

test("show/hide when pressing enter on disclosure", async () => {
  await press.Tab();
  await press.Enter();
  await waitFor(() => expect(q.dialog()).toBeVisible());
  expect(q.button("Accept")).toHaveFocus();
  await press.ShiftTab();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
});

test("show/hide when pressing space on disclosure", async () => {
  await press.Tab();
  await press.Space();
  await waitFor(() => expect(q.dialog()).toBeVisible());
  expect(q.button("Accept")).toHaveFocus();
  await press.ShiftTab();
  await press.Space();
  expect(q.dialog()).not.toBeInTheDocument();
});

test("hide when pressing escape on disclosure", async () => {
  await click(q.button("Accept invite"));
  await waitFor(() => expect(q.dialog()).toBeVisible());
  await press.ShiftTab();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
});

test("hide when pressing escape on popover", async () => {
  await click(q.button("Accept invite"));
  await waitFor(() => expect(q.dialog()).toBeVisible());
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Accept invite")).toHaveFocus();
});
