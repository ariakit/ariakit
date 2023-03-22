import { click, getByRole, press, render } from "@ariakit/test";
import Example from "./index.js";

test("check/uncheck on click", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).not.toBeChecked();
});

test("check/uncheck on space", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Tab();
  await press.Space();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).not.toBeChecked();
});
