import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6299
test("enters an RTL composite from the base element with ArrowLeft", async () => {
  const toolbar = q.toolbar("Text formatting");

  await press.Tab();

  expect(toolbar).toHaveFocus();

  await press.ArrowLeft();
  expect(q.button("Bold")).toHaveFocus();

  await press.ArrowLeft();
  expect(q.button("Italic")).toHaveFocus();
});

// Use a fresh render so the toolbar has no active item when focused.
test("enters an RTL composite from the base element with ArrowRight", async () => {
  const toolbar = q.toolbar("Text formatting");

  await press.Tab();

  expect(toolbar).toHaveFocus();

  await press.ArrowRight();
  expect(q.button("Underline")).toHaveFocus();

  await press.ArrowRight();
  expect(q.button("Italic")).toHaveFocus();
});
