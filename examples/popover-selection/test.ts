import { click, press, q, select } from "@ariakit/test";

Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

test("show/hide popover on text selection", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await select("dolor, sit");
  expect(q.dialog()).toBeVisible();
  await click(q.text(/^Lorem ipsum/));
  expect(q.dialog()).not.toBeInTheDocument();
});

test("tab to popover", async () => {
  await select("amet");
  expect(q.dialog()).toBeVisible();
  await press.ShiftTab();
  expect(q.dialog()).toBeVisible();
  expect(q.button("Share")).toHaveFocus();
});

test("click on popover button", async () => {
  await select("maxime.");
  expect(q.dialog()).toBeVisible();
  await click(q.button("Bookmark"));
  expect(q.dialog()).toBeVisible();
  expect(q.button("Bookmark")).toHaveFocus();
});
