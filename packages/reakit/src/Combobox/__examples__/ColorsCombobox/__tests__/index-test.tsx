import * as React from "react";
import { render, press, click, type, screen } from "reakit-test-utils";
import ColorsCombobox from "..";

test("open combobox popover on click", () => {
  render(<ColorsCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Colors")).toHaveFocus();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  expect(screen.getByText("AliceBlue")).not.toHaveFocus();
});

test("open combobox popover on arrow down", () => {
  render(<ColorsCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Colors")).toHaveFocus();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  press.ArrowDown();
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  expect(screen.getByText("AliceBlue")).not.toHaveFocus();
});

test("open combobox popover on arrow up", () => {
  render(<ColorsCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Colors")).toHaveFocus();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  press.ArrowUp();
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  expect(screen.getByText("AliceBlue")).not.toHaveFocus();
});

test("open combobox popover by typing on the combobox", () => {
  render(<ColorsCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Colors")).toHaveFocus();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  type("s");
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  expect(screen.getByText("Bisque")).not.toHaveFocus();
});

test("do not open combobox popover on arrow right/left", () => {
  render(<ColorsCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Colors")).toHaveFocus();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  press.ArrowLeft();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  press.ArrowRight();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
});
