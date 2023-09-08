import { click, getByRole } from "@ariakit/test";

const getCheckbox = (name: string) => getByRole("checkbox", { name: name });

test("check checkbox with integer-like name on click", async () => {
  expect(getCheckbox("123")).toBeChecked();
  await click(getCheckbox("123"));
  expect(getCheckbox("123")).not.toBeChecked();
});

test("check checkbox with non integer-like name on click", async () => {
  expect(getCheckbox("safe")).toBeChecked();
  await click(getCheckbox("safe"));
  expect(getCheckbox("safe")).not.toBeChecked();
});
