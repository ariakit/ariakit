import { click, dispatch, press, q, waitFor } from "@ariakit/test";
import { expect, test } from "vitest";

test("show on disclosure click", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});

test("show on disclosure enter", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Tab();
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});

test("show on disclosure space", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Tab();
  await press.Space();
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});

test("focus trap", async () => {
  await click(q.button("Show modal"));
  expect(q.button("OK")).toHaveFocus();
  await press.Tab();
  expect(q.button("OK")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("OK")).toHaveFocus();
});

test("hide on escape", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("hide on click outside", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await click(document.body);
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).not.toHaveFocus();
});

test("hide on right-click outside does not restore focus", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await dispatch.contextMenu(document.body);
  await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
  expect(q.button("Show modal")).not.toHaveFocus();
});

test("restore focus on escape after a previous click-outside hide", async () => {
  // Hiding by clicking outside must not restore focus to the disclosure.
  await click(q.button("Show modal"));
  await click(document.body);
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).not.toHaveFocus();
  // Reopening must clear the outside-interaction state so a subsequent keyboard
  // hide does restore focus to the disclosure (the flag must not leak across
  // hides).
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("hide on dismiss button click", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await click(q.button("OK"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("hide on dismiss button enter", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("hide on dismiss button space", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await press.Space();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});
