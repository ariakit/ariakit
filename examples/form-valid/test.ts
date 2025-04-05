import { click, press, q, type } from "@ariakit/test";

test("submit button is disabled by default", async () => {
  expect(q.button("Add")).toHaveAttribute("aria-disabled", "true");
});

test("submit button is disabled when the form resets", async () => {
  await press.Tab();
  await type("a");
  await press.Tab();
  await type("a@a");
  expect(q.button("Add")).not.toHaveAttribute("aria-disabled");
  await click(q.button("Reset"));
  expect(q.button("Add")).toHaveAttribute("aria-disabled");
});

test("submit button is disabled when the form is submitted", async () => {
  await press.Tab();
  await type("a");
  await press.Tab();
  await type("a@a");
  expect(q.button("Add")).not.toHaveAttribute("aria-disabled");
  await click(q.button("Add"));
  expect(q.button("Add")).toHaveAttribute("aria-disabled");
});

test("submit button is disabled when the form becomes invalid", async () => {
  await press.Tab();
  await type("a");
  await press.Tab();
  await type("a@a");
  expect(q.button("Add")).not.toHaveAttribute("aria-disabled");
  await press.ShiftTab();
  await press.Backspace();
  expect(q.button("Add")).toHaveAttribute("aria-disabled");
});
