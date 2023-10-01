import { click, press, q } from "@ariakit/test";

test("show/hide on disclosure click", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.link());
  expect(q.dialog()).toBeVisible();
  expect(q.textbox()).toHaveFocus();
  await press.ShiftTab();
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
