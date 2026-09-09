import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781710
test("uses progress as the default check state and preserves explicit values", () => {
  const completed = q.within(q.list("Completed progress"));
  const unchecked = q.within(q.list("Explicit unchecked state"));
  const checked = q.within(q.list("Explicit checked state"));
  expect(completed.img("Checked")).toBeVisible();
  expect(unchecked.img("Unchecked")).toBeVisible();
  expect(checked.img("Checked")).toBeVisible();
});
