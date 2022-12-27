import { click, getByRole, press, render } from "@ariakit/test";
import Example from ".";

const getDisclosure = () => getByRole("button", { name: "Show modal" });
const getDialog = () => getByRole("dialog", { hidden: true });
const getDismiss = () => getByRole("button", { name: "OK" });

test("show on disclosure click", async () => {
  render(<Example />);
  expect(getDialog()).not.toBeVisible();
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  expect(getDismiss()).toHaveFocus();
});

test("show on disclosure enter", async () => {
  render(<Example />);
  expect(getDialog()).not.toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(getDialog()).toBeVisible();
  expect(getDismiss()).toHaveFocus();
});

test("show on disclosure space", async () => {
  render(<Example />);
  expect(getDialog()).not.toBeVisible();
  await press.Tab();
  await press.Space();
  expect(getDialog()).toBeVisible();
  expect(getDismiss()).toHaveFocus();
});

test("focus trap", async () => {
  render(<Example />);
  await click(getDisclosure());
  expect(getDismiss()).toHaveFocus();
  await press.Tab();
  expect(getDismiss()).toHaveFocus();
  await press.ShiftTab();
  expect(getDismiss()).toHaveFocus();
});

test("hide on escape", async () => {
  render(<Example />);
  await click(getDisclosure());
  expect(getByRole("dialog")).toBeVisible();
  await press.Escape();
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on click outside", async () => {
  const { baseElement } = render(<Example />);
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await click(baseElement);
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on dismiss button click", async () => {
  render(<Example />);
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await click(getDismiss());
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on dismiss button enter", async () => {
  render(<Example />);
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await press.Enter();
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on dismiss button space", async () => {
  render(<Example />);
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await press.Space();
  expect(getDialog()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});
