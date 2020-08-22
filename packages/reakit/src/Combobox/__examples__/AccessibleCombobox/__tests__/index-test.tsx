import * as React from "react";
import { render, press, click, type, screen } from "reakit-test-utils";
import AccessibleCombobox from "..";

test("open combobox popover on click", () => {
  render(<AccessibleCombobox />);
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  expect(screen.getByText("Apple")).not.toHaveFocus();
});

test("open combobox popover on arrow down", () => {
  render(<AccessibleCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  expect(screen.getByText("Apple")).not.toHaveFocus();
});

test("open combobox popover on arrow up", () => {
  render(<AccessibleCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  press.ArrowUp();
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  expect(screen.getByText("Banana")).not.toHaveFocus();
});

test("open combobox popover by typing on the combobox", () => {
  render(<AccessibleCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  type("a");
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  expect(screen.getByText("Apple")).not.toHaveFocus();
});

test("do not open combobox popover on arrow right/left", () => {
  render(<AccessibleCombobox />);
  press.Tab();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  press.ArrowLeft();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  press.ArrowRight();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
});

test("close combobox popover by clicking outside", () => {
  const { baseElement } = render(<AccessibleCombobox />);
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  click(baseElement);
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
});

test("close combobox popover by tabbing out", () => {
  render(
    <>
      <AccessibleCombobox />
      <button>button</button>
    </>
  );
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  press.Tab();
  expect(screen.getByText("button")).toHaveFocus();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
});

test("close combobox popover by pressing esc", () => {
  render(<AccessibleCombobox />);
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  press.Escape();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
});

test("open combobox popover after pressing esc", () => {
  render(<AccessibleCombobox />);
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  press.Escape();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  press.Escape();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  press.ArrowUp();
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  press.Escape();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  type("a");
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  press.Escape();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  type("\b");
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
});

test("open combobox popover after pressing esc twice", () => {
  render(<AccessibleCombobox />);
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  press.Escape();
  press.Escape();
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
});

test("move through combobox options with keyboard", () => {
  render(<AccessibleCombobox />);
  click(screen.getByLabelText("Fruits"));
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
  expect(screen.getByText("Apple")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Orange")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Banana")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
  expect(screen.getByText("Apple")).not.toHaveFocus();
  expect(screen.getByText("Orange")).not.toHaveFocus();
  expect(screen.getByText("Banana")).not.toHaveFocus();
  press.ArrowUp();
  expect(screen.getByText("Banana")).toHaveFocus();
  press.ArrowUp();
  expect(screen.getByText("Orange")).toHaveFocus();
  press.ArrowUp();
  expect(screen.getByText("Apple")).toHaveFocus();
  press.ArrowUp();
  expect(screen.getByLabelText("Fruits")).toHaveFocus();
  expect(screen.getByText("Apple")).not.toHaveFocus();
  expect(screen.getByText("Orange")).not.toHaveFocus();
  expect(screen.getByText("Banana")).not.toHaveFocus();
  press.ArrowUp();
  expect(screen.getByText("Banana")).toHaveFocus();
  press.ArrowRight();
  expect(screen.getByText("Banana")).toHaveFocus();
  press.ArrowLeft();
  expect(screen.getByText("Banana")).toHaveFocus();
  press.Home();
  expect(screen.getByText("Apple")).toHaveFocus();
  press.End();
  expect(screen.getByText("Banana")).toHaveFocus();
});

test("select combobox option by clicking on it", () => {
  render(<AccessibleCombobox />);
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
  click(screen.getByText("Orange"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("Orange");
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  type("\b\b\b\b\b\ba");
  expect(screen.getByLabelText("Fruits")).toHaveValue("a");
  click(screen.getByText("Apple"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("Apple");
});

test("select combobox option by pressing enter on it", () => {
  render(<AccessibleCombobox />);
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
  press.End();
  press.Enter();
  expect(screen.getByLabelText("Fruits")).toHaveValue("Banana");
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  type("\b\b\b\b\b\ba");
  expect(screen.getByLabelText("Fruits")).toHaveValue("a");
  press.Home();
  press.Enter();
  expect(screen.getByLabelText("Fruits")).toHaveValue("Apple");
});

test("do not select combobox option by pressing space on it", () => {
  render(<AccessibleCombobox />);
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
  press.ArrowDown();
  press.Space();
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
});

test("unselect combobox option when typing on the combobox", () => {
  render(<AccessibleCombobox />);
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
  press.ArrowDown();
  expect(screen.getByText("Apple")).toHaveFocus();
  type("a");
  expect(screen.getByText("Apple")).not.toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("Apple")).toHaveFocus();
});
