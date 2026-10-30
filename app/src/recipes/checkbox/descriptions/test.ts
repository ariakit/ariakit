import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each setting with its label and describes it with its description", () => {
  const group = q.within(q.group("Privacy"));
  const usage = group.checkbox("Share usage data");
  expect(usage).toBeChecked();
  expect(usage).toHaveAccessibleDescription(
    "Anonymous crash reports and usage statistics",
  );
  const search = group.checkbox("Show my profile in search");
  expect(search).not.toBeChecked();
  expect(search).toHaveAccessibleDescription(
    "People outside your team can find you by name",
  );
});
