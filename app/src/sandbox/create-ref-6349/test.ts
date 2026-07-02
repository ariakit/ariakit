import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6349
test("resets a function-typed ref to its initial value", async () => {
  expect(q.text("Stored value type: function")).toBeVisible();

  await click(q.button("Use email handler"));
  await click(q.button("Focus field"));
  expect(q.textbox("Email")).toHaveFocus();

  await click(q.button("Restore default"));
  expect(q.textbox("Name")).not.toHaveFocus();
  expect(q.text("Stored value type: function")).toBeVisible();

  await click(q.button("Focus field"));
  expect(q.textbox("Name")).toHaveFocus();
});
