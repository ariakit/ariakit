import { click, getByLabelText, getByRole, press } from "@ariakit/test";

test("check checkbox on click", async () => {
  expect(getByRole("checkbox")).toBeChecked();
  await click(
    getByLabelText("I have read and agree to the terms and conditions"),
  );
  expect(getByRole("checkbox")).not.toBeChecked();
});

test("tab", async () => {
  expect(getByRole("checkbox")).not.toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
});

test("space", async () => {
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).toBeChecked();
});
