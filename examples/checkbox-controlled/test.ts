import { expect, test, click, q } from "../../browser-test-utils.ts";

test("change controlled state", async () => {
  expect(q.checkbox()).toBeChecked();
  await click(q.checkbox());
  expect(q.checkbox()).not.toBeChecked();
});
