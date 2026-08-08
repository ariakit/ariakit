import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("check/uncheck on click", async () => {
  const label = q.text("Technology");
  expect(q.checkbox()).toBeChecked();
  await click(label);
  expect(q.checkbox()).not.toBeChecked();
  await click(label);
  expect(q.checkbox()).toBeChecked();
});

test("check/uncheck on space", async () => {
  expect(q.checkbox()).toBeChecked();
  await press.Tab();
  await press.Space();
  expect(q.checkbox()).not.toBeChecked();
  await press.Space();
  expect(q.checkbox()).toBeChecked();
});

test("check/uncheck on enter", async () => {
  expect(q.checkbox()).toBeChecked();
  await press.Tab();
  await press.Enter();
  expect(q.checkbox()).not.toBeChecked();
  await press.Enter();
  expect(q.checkbox()).toBeChecked();
});
