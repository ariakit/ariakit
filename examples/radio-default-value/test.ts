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
  expect(getByLabelText("orange")).toBeChecked();
  expect(getByLabelText("watermelon")).not.toHaveFocus();
  await press.ArrowDown();
  expect(getByLabelText("watermelon")).toHaveFocus();
  expect(getByLabelText("watermelon")).toBeChecked();
  await press.ArrowDown();
  expect(getByLabelText("apple")).toHaveFocus();
  expect(getByLabelText("apple")).toBeChecked();
});
