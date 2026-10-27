import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each theme with its label, not its picture", async () => {
  const group = q.within(q.radiogroup("Theme"));
  expect(group.radio("System")).toBeChecked();
  await click(group.text("Dark"));
  expect(group.radio("Dark")).toBeChecked();
  expect(group.radio("System")).not.toBeChecked();
});
