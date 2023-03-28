import { click, getByRole, press, queryByRole } from "@ariakit/test";

const getPopover = () => queryByRole("dialog", { hidden: true });
const getDisclosure = () => getByRole("button", { name: "Accept invite" });
const getButton = (name: string) => getByRole("button", { name });

test("show/hide when clicking on disclosure", async () => {
  expect(getPopover()).not.toBeInTheDocument();
  await click(getDisclosure());
  expect(getPopover()).toBeVisible();
  expect(getButton("Accept")).toHaveFocus();
  await click(getDisclosure());
  expect(getPopover()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});

test("show/hide when pressing enter on disclosure", async () => {
  await press.Tab();
  await press.Enter();
  expect(getPopover()).toBeVisible();
  expect(getButton("Accept")).toHaveFocus();
  await press.ShiftTab();
  await press.Enter();
  expect(getPopover()).not.toBeInTheDocument();
});

test("show/hide when pressing space on disclosure", async () => {
  await press.Tab();
  await press.Space();
  expect(getPopover()).toBeVisible();
  expect(getButton("Accept")).toHaveFocus();
  await press.ShiftTab();
  await press.Space();
  expect(getPopover()).not.toBeInTheDocument();
});

test("hide when pressing escape on disclosure", async () => {
  await click(getDisclosure());
  await press.ShiftTab();
  expect(getPopover()).toBeVisible();
  await press.Escape();
  expect(getPopover()).not.toBeInTheDocument();
});

test("hide when pressing escape on popover", async () => {
  await click(getDisclosure());
  expect(getPopover()).toBeVisible();
  await press.Escape();
  expect(getPopover()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});
