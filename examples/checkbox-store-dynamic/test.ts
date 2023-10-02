import { click, q } from "@ariakit/test";

test("check/uncheck all checkboxes by clicking on checkbox 1", async () => {
  expect(q.checkbox("Checkbox 1")).toBeChecked();
  expect(q.checkbox("Checkbox 2")).toBeChecked();
  await click(q.checkbox("Checkbox 1"));
  expect(q.checkbox("Checkbox 1")).not.toBeChecked();
  expect(q.checkbox("Checkbox 2")).not.toBeChecked();
  await click(q.checkbox("Checkbox 1"));
  expect(q.checkbox("Checkbox 1")).toBeChecked();
  expect(q.checkbox("Checkbox 2")).toBeChecked();
});

test("uncheck all checkboxes by clicking on checkbox 2", async () => {
  expect(q.checkbox("Checkbox 1")).toBeChecked();
  expect(q.checkbox("Checkbox 2")).toBeChecked();
  await click(q.checkbox("Checkbox 2"));
  expect(q.checkbox("Checkbox 1")).not.toBeChecked();
  expect(q.checkbox("Checkbox 2")).not.toBeChecked();
  await click(q.checkbox("Checkbox 2"));
  expect(q.checkbox("Checkbox 1")).not.toBeChecked();
  expect(q.checkbox("Checkbox 2")).toBeChecked();
});
