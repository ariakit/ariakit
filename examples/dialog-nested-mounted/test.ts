import { click, getByRole, press, queryByRole } from "@ariakit/test";

const getButton = (name: string) => getByRole("button", { name });

const getDialog = () => queryByRole("dialog", { hidden: true, name: "Dialog" });

const getNestedDialog = () =>
  queryByRole("dialog", { hidden: true, name: "Confirm" });

test("show dialog", async () => {
  expect(getDialog()).not.toBeInTheDocument();
  await click(getButton("Open dialog"));
  expect(getDialog()).toBeVisible();
  expect(getButton("Close")).toHaveFocus();
});

test("show nested dialog", async () => {
  await click(getButton("Open dialog"));
  expect(getNestedDialog()).not.toBeInTheDocument();
  await click(getButton("Open nested dialog"));
  expect(getDialog()).toBeVisible();
  expect(getNestedDialog()).toBeVisible();
  await press.Enter();
  expect(getNestedDialog()).not.toBeInTheDocument();
  expect(getDialog()).toBeVisible();
  expect(getButton("Open nested dialog")).toHaveFocus();
});
