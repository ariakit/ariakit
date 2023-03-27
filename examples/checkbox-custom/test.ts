import { click, getByRole, press } from "@ariakit/test";

test("check/uncheck on click", async () => {
  expect(getByRole("checkbox")).not.toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).not.toBeChecked();
});

test("check/uncheck on space", async () => {
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Tab();
  await press.Space();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).not.toBeChecked();
});
