import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("change controlled state", async () => {
  expect(q.checkbox()).toBeChecked();
  await click(q.checkbox());
  expect(q.checkbox()).not.toBeChecked();
});
