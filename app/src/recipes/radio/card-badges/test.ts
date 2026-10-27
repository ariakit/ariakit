import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("reads the badge after the plan name and the price as a description", async () => {
  const group = q.within(q.radiogroup("Plan"));
  const pro = group.radio("Pro Popular");
  expect(pro).toBeChecked();
  expect(pro).toHaveAccessibleDescription("$12 per month. For growing teams.");
  await click(group.text("Team"));
  expect(group.radio("Team")).toBeChecked();
});
