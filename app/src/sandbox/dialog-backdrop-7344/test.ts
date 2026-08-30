// See https://github.com/ariakit/ariakit/issues/7344
import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("backdrop carries the hidden attribute along with the dialog", async () => {
  expect(q.dialog.hidden()).toHaveAttribute("hidden");
  expect(q.presentation.hidden()).toHaveAttribute("hidden");

  await click(q.button("Show dialog"));
  expect(q.dialog()).not.toHaveAttribute("hidden");
  expect(q.presentation()).not.toHaveAttribute("hidden");

  await click(q.button("Close"));
  expect(q.dialog.hidden()).toHaveAttribute("hidden");
  expect(q.presentation.hidden()).toHaveAttribute("hidden");
});
