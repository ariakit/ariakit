import { click, getByRole, press, queryByRole, render } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

const getPopover = () => queryByRole("dialog", { hidden: true });
const getDisclosure = () => getByRole("button", { name: "Accept invite" });
const getButton = (name: string) => getByRole("button", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("show/hide when clicking on disclosure", async () => {
  render(<Example />);
  expect(getPopover()).not.toBeInTheDocument();
  await click(getDisclosure());
  expect(getPopover()).toBeVisible();
  expect(getButton("Accept")).toHaveFocus();
  await click(getDisclosure());
  expect(getPopover()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});

test("show/hide when pressing enter on disclosure", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(getPopover()).toBeVisible();
  expect(getButton("Accept")).toHaveFocus();
  await press.ShiftTab();
  await press.Enter();
  expect(getPopover()).not.toBeInTheDocument();
});

test("show/hide when pressing space on disclosure", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  expect(getPopover()).toBeVisible();
  expect(getButton("Accept")).toHaveFocus();
  await press.ShiftTab();
  await press.Space();
  expect(getPopover()).not.toBeInTheDocument();
});

test("hide when pressing escape on disclosure", async () => {
  render(<Example />);
  await click(getDisclosure());
  await press.ShiftTab();
  expect(getPopover()).toBeVisible();
  await press.Escape();
  expect(getPopover()).not.toBeInTheDocument();
});

test("hide when pressing escape on popover", async () => {
  render(<Example />);
  await click(getDisclosure());
  expect(getPopover()).toBeVisible();
  await press.Escape();
  expect(getPopover()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});
