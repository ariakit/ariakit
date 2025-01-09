import { click, press, q } from "@ariakit/test";

test("show/hide on disclosure click with mouse", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.link());
  expect(q.dialog()).toBeVisible();
  expect(q.textbox()).toHaveFocus();
  await click(q.link("Dismiss popup"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link()).toHaveFocus();
});

test("show/hide on disclosure click with keyboard", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.link());
  expect(q.dialog()).toBeVisible();
  expect(q.textbox()).toHaveFocus();
  await press.ShiftTab();
  expect(q.link()).toHaveFocus();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link()).toHaveFocus();
});

test("hide on escape", async () => {
  await click(q.link());
  expect(q.dialog()).toBeVisible();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link()).toHaveFocus();
});

test("hide on click outside", async () => {
  await click(q.link());
  expect(q.dialog()).toBeVisible();
  await click(document.body);
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link()).toHaveFocus();
});

test("hide on submit", async () => {
  await click(q.link());
  expect(q.dialog()).toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link()).toHaveFocus();
});
