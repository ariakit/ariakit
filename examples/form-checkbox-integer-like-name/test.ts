import { click, q } from "@ariakit/test";

test("check checkbox with integer-like name on click", async () => {
  expect(q.checkbox("123")).toBeChecked();
  await click(q.checkbox("123"));
  expect(q.checkbox("123")).not.toBeChecked();
});

test("check checkbox with non integer-like name on click", async () => {
  expect(q.checkbox("safe")).toBeChecked();
  await click(q.checkbox("safe"));
  expect(q.checkbox("safe")).not.toBeChecked();
});
