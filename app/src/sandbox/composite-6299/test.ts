import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6299
test("enters and traverses an RTL composite from the base element", async () => {
  const toolbar = q.toolbar("Text formatting");

  await press.Tab();

  expect(toolbar).toHaveFocus();

  await press.ArrowLeft();
  expect(q.button("Bold")).toHaveFocus();

  await press.ArrowLeft();
  expect(q.button("Italic")).toHaveFocus();

  toolbar.focus();

  await press.ArrowRight();
  expect(q.button("Underline")).toHaveFocus();

  await press.ArrowRight();
  expect(q.button("Italic")).toHaveFocus();
});
