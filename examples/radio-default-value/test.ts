import { getByLabelText, press } from "@ariakit/test";

test("default value", async () => {
  expect(getByLabelText("apple")).not.toBeChecked();
  expect(getByLabelText("orange")).toBeChecked();
  expect(getByLabelText("watermelon")).not.toBeChecked();
});

test("default focus", async () => {
  await press.Tab();
  expect(getByLabelText("apple")).not.toHaveFocus();
  expect(getByLabelText("orange")).toHaveFocus();
  expect(getByLabelText("watermelon")).not.toHaveFocus();
});
