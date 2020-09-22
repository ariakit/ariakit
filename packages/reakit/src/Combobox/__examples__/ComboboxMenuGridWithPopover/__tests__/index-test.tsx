import * as React from "react";
import { render, press, click, type, screen } from "reakit-test-utils";
import ComboboxMenuGridWithPopover from "..";

function getPopoverDisclosure() {
  return screen.getByText("Blocks");
}

function getPopover() {
  return screen.queryByRole("dialog", { name: "Blocks" });
}

function getComboboxInput() {
  return screen.queryByRole("combobox", { name: "Block search" });
}

test("open popover on click", () => {
  render(<ComboboxMenuGridWithPopover />);
  expect(getPopover()).not.toBeInTheDocument();
  click(getPopoverDisclosure());
  expect(getPopover()).toBeVisible();
  expect(getComboboxInput()).toHaveFocus();
});

test("keyboard navigation on grid", () => {
  render(<ComboboxMenuGridWithPopover />);
  click(getPopoverDisclosure());
  expect(getComboboxInput()).toHaveFocus();
  press.Tab();
  expect(screen.getByText("Paragraph")).toHaveFocus();
  press.Tab();
  expect(screen.getByText("Image")).toHaveFocus();
  press.Tab();
  expect(screen.getByText("Shortcode")).toHaveFocus();
  press.ShiftTab();
  expect(screen.getByText("Image")).toHaveFocus();
  press.ArrowRight();
  press.ArrowRight();
  press.ArrowRight();
  expect(screen.getByText("Cover")).toHaveFocus();
  press.ArrowRight();
  press.ArrowRight();
  expect(screen.getByText("Media & Text")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Video")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Shortcode")).toHaveFocus();
});

test("pressing character key while focusing grid item", () => {
  render(<ComboboxMenuGridWithPopover />);
  click(getPopoverDisclosure());
  press.Tab();
  expect(screen.getByText("Paragraph")).toHaveFocus();
  type("l");
  expect(getComboboxInput()).toHaveFocus();
  type("a");
  expect(getComboboxInput()).toHaveValue("la");
  expect(screen.getByText("Latest Comments")).toHaveFocus();
});

test("keyboard navigation on combobox grid", () => {
  render(<ComboboxMenuGridWithPopover />);
  click(getPopoverDisclosure());
  type("r");
  expect(screen.getByText("RSS")).toHaveFocus();
  press.ArrowRight();
  expect(screen.getByText("Paragraph")).toHaveFocus();
  press.ArrowRight();
  expect(screen.getByText("Gallery")).toHaveFocus();
  press.ArrowRight();
  expect(screen.getByText("Shortcode")).toHaveFocus();
  press.End();
  expect(screen.getByText("Calendar")).toHaveFocus();
  press.PageDown();
  expect(screen.getByText("Spacer")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Verse")).toHaveFocus();
  press.PageUp();
  expect(screen.getByText("RSS")).toHaveFocus();
  press.ArrowUp();
  expect(screen.getByText("RSS")).not.toHaveFocus();
  press.ArrowRight();
  press.ArrowDown();
  expect(screen.getByText("RSS")).toHaveFocus();
});
