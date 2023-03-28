import { getByRole, press } from "@ariakit/test";

const getButton = (name: string) => getByRole("button", { name });
const getSelect = () => getByRole("combobox", { name: "Text alignment" });
const getList = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) => getByRole("option", { name });

test("navigate with keyboard", async () => {
  await press.Tab();
  expect(getButton("Bold")).toHaveFocus();
  await press.ArrowRight();
  await press.ArrowRight();
  await press.ArrowRight();
  expect(getSelect()).toHaveFocus();
  await press.ArrowRight();
  expect(getButton("Bold")).toHaveFocus();
  await press.End();
  expect(getSelect()).toHaveFocus();
  expect(getList()).not.toBeVisible();
  await press.ArrowDown();
  expect(getList()).toBeVisible();
  expect(getOption("Align Left")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("Align Center")).toHaveFocus();
  await press.ShiftTab();
  expect(getSelect()).toHaveFocus();
  expect(getList()).toBeVisible();
  await press.Tab();
  expect(getOption("Align Center")).toHaveFocus();
  await press.Enter();
  expect(getList()).not.toBeVisible();
  expect(getSelect()).toHaveFocus();
  await press.ArrowLeft();
  expect(getButton("Underline")).toHaveFocus();
});
