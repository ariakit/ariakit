import { click, getByRole, press } from "@ariakit/test";

const getDisclosure = () => getByRole("button", { name: "Show modal" });
const getDialog = () => getByRole("dialog", { hidden: true });
const getDismiss = () => getByRole("button", { name: "OK" });

test("show on disclosure click", async () => {
  expect(getDialog()).not.toBeVisible();
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  expect(getDismiss()).toHaveFocus();
});

test("show on disclosure enter", async () => {
  expect(getDialog()).not.toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(getDialog()).toBeVisible();
  expect(getDismiss()).toHaveFocus();
});

test("show on disclosure space", async () => {
  expect(getDialog()).not.toBeVisible();
  await press.Tab();
  await press.Space();
  expect(getDialog()).toBeVisible();
  expect(getDismiss()).toHaveFocus();
});

test("focus trap", async () => {
  await click(getDisclosure());
  expect(getDismiss()).toHaveFocus();
  await press.Tab();
  expect(getDismiss()).toHaveFocus();
  await press.ShiftTab();
  expect(getDismiss()).toHaveFocus();
});

test("hide on escape", async () => {
  await click(getDisclosure());
  expect(getByRole("dialog")).toBeVisible();
  await press.Escape();
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on click outside", async () => {
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await click(document.body);
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on dismiss button click", async () => {
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await click(getDismiss());
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on dismiss button enter", async () => {
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await press.Enter();
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on dismiss button space", async () => {
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await press.Space();
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});
