import { click, getByRole } from "@ariakit/test";

const getCheckbox = (name: string) => getByRole("checkbox", { name });

test("check/uncheck all checkboxes by clicking on checkbox 1", async () => {
  expect(getCheckbox("Checkbox 1")).toBeChecked();
  expect(getCheckbox("Checkbox 2")).toBeChecked();
  await click(getCheckbox("Checkbox 1"));
  expect(getCheckbox("Checkbox 1")).not.toBeChecked();
  expect(getCheckbox("Checkbox 2")).not.toBeChecked();
  await click(getCheckbox("Checkbox 1"));
  expect(getCheckbox("Checkbox 1")).toBeChecked();
  expect(getCheckbox("Checkbox 2")).toBeChecked();
});

test("uncheck all checkboxes by clicking on checkbox 2", async () => {
  expect(getCheckbox("Checkbox 1")).toBeChecked();
  expect(getCheckbox("Checkbox 2")).toBeChecked();
  await click(getCheckbox("Checkbox 2"));
  expect(getCheckbox("Checkbox 1")).not.toBeChecked();
  expect(getCheckbox("Checkbox 2")).not.toBeChecked();
  await click(getCheckbox("Checkbox 2"));
  expect(getCheckbox("Checkbox 1")).not.toBeChecked();
  expect(getCheckbox("Checkbox 2")).toBeChecked();
});
