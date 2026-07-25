import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3649287442
test("closes the modal popover with Escape from the input inside it", async () => {
  await click(q.combobox.ensure("Favorite fruit"));
  expect(q.combobox("Search fruits")).toHaveFocus();
  await press.Escape();
  expect(q.combobox("Favorite fruit")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(q.combobox("Favorite fruit")).toHaveFocus();
});

test("keeps the combobox select interactive while the rest is inert", async () => {
  await click(q.combobox.ensure("Favorite fruit"));
  expect(q.button("Outside")).not.toBeInTheDocument();
  expect(q.combobox("Favorite fruit")).toBeInTheDocument();
});
