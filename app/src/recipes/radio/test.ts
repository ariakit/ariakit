import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the group with its label and checks the default sort", () => {
  const group = q.within(q.radiogroup("Sort comments by"));
  expect(group.radio("Newest first")).toBeChecked();
  expect(group.radio("Oldest first")).not.toBeChecked();
});

test("tabs to the checked radio and checks the next one with an arrow key", async () => {
  await press.Tab();
  expect(q.radio("Newest first")).toHaveFocus();
  await press.ArrowDown();
  expect(q.radio("Oldest first")).toHaveFocus();
  expect(q.radio("Oldest first")).toBeChecked();
  expect(q.radio("Newest first")).not.toBeChecked();
});
