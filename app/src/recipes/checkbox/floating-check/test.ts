import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each photo with its label, not its picture", async () => {
  const group = q.within(q.group("Photos to share"));
  expect(group.checkbox("Mountains")).toBeChecked();
  expect(group.checkbox("Forest")).not.toBeChecked();
  await click(group.text("Forest"));
  expect(group.checkbox("Forest")).toBeChecked();
  expect(group.checkbox("Mountains")).toBeChecked();
});
