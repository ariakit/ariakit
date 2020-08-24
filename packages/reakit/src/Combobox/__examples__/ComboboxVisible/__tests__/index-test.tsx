import * as React from "react";
import { render, press, click, type, screen } from "reakit-test-utils";
import ComboboxVisible from "..";

test("combobox is visible by default", () => {
  render(<ComboboxVisible />);
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  expect(screen.getByText("Red")).not.toHaveFocus();
});

test("type on the combobox", () => {
  render(<ComboboxVisible />);
  press.Tab();
  expect(screen.getByLabelText("Colors")).toHaveFocus();
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  type("a");
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  expect(screen.getByText("Red")).not.toHaveFocus();
});

test("close combobox popover by clicking outside", () => {
  const { baseElement } = render(<ComboboxVisible />);
  expect(screen.getByLabelText("Colors suggestions")).toBeVisible();
  click(baseElement);
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
});

test("close combobox popover by pressing esc", () => {
  render(<ComboboxVisible />);
  click(screen.getByLabelText("Colors"));
  press.Escape();
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  expect(screen.getByLabelText("Colors")).toHaveFocus();
});

test("move through combobox options with keyboard", () => {
  render(<ComboboxVisible />);
  click(screen.getByLabelText("Colors"));
  press.ArrowDown();
  expect(screen.getByText("Red")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Green")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Blue")).toHaveFocus();
  press.Home();
  expect(screen.getByText("Red")).toHaveFocus();
  press.End();
  expect(screen.getByText("Blue")).toHaveFocus();
});

test("select combobox option by clicking on it", () => {
  render(<ComboboxVisible />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  click(screen.getByText("Green"));
  expect(screen.getByLabelText("Colors")).toHaveValue("Green");
  expect(screen.getByLabelText("Colors suggestions")).not.toBeVisible();
  type("\b\b\b\b\b\ba");
  expect(screen.getByLabelText("Colors")).toHaveValue("a");
  click(screen.getByText("Red"));
  expect(screen.getByLabelText("Colors")).toHaveValue("Red");
});
