import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the group with its legend and checks the default options", () => {
  const group = q.within(q.group("Notify me about"));
  expect(group.checkbox("Comments")).toBeChecked();
  expect(group.checkbox("Mentions")).toBeChecked();
  expect(group.checkbox("Weekly digest")).not.toBeChecked();
});

test("toggles each checkbox on its own", async () => {
  await click(q.text("Weekly digest"));
  expect(q.checkbox("Weekly digest")).toBeChecked();
  await click(q.text("Comments"));
  expect(q.checkbox("Comments")).not.toBeChecked();
  expect(q.checkbox("Mentions")).toBeChecked();
  expect(q.checkbox("Weekly digest")).toBeChecked();
});
