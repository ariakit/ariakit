import {
  click,
  getByRole,
  getByText,
  press,
  queryByRole,
  render,
  select,
} from "@ariakit/test";
import Example from "./index.js";

const getPopover = () => queryByRole("dialog", { hidden: true });
const getParagraph = () => getByText(/^Lorem ipsum dolor/);
const getButton = (name: string) => getByRole("button", { name });

Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

test("show/hide popover on text selection", async () => {
  render(<Example />);
  expect(getPopover()).not.toBeVisible();
  await select("dolor, sit");
  expect(getPopover()).toBeVisible();
  await click(getParagraph());
  expect(getPopover()).not.toBeVisible();
});

test("tab to popover", async () => {
  render(<Example />);
  await select("amet");
  expect(getPopover()).toBeVisible();
  await press.ShiftTab();
  expect(getPopover()).toBeVisible();
  expect(getButton("Share")).toHaveFocus();
});

test("click on popover button", async () => {
  render(<Example />);
  await select("maxime.");
  expect(getPopover()).toBeVisible();
  await click(getButton("Bookmark"));
  expect(getPopover()).toBeVisible();
  expect(getButton("Bookmark")).toHaveFocus();
});
