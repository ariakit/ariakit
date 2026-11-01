import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the group and checks the default theme", () => {
  const group = q.within(q.radiogroup("Theme"));
  expect(group.radio("System")).toBeChecked();
  expect(group.radio("Light")).not.toBeChecked();
});

test("tabs to the checked segment and checks the next one with an arrow key", async () => {
  await press.Tab();
  expect(q.radio("System")).toHaveFocus();
  await press.ArrowRight();
  expect(q.radio("Light")).toHaveFocus();
  expect(q.radio("Light")).toBeChecked();
  expect(q.radio("System")).not.toBeChecked();
});
