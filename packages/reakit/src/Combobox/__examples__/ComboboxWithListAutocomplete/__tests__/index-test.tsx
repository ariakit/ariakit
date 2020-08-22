import * as React from "react";
import {
  render,
  press,
  focus,
  click,
  fireEvent,
  screen,
} from "reakit-test-utils";
import ComboboxWithInlineAutocomplete from "..";

test("change combobox value by focusing on combobox options", () => {
  render(<ComboboxWithInlineAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  focus(screen.getByText("Red"));
  expect(screen.getByLabelText("Colors")).toHaveValue("Red");
});

test("change combobox value by arrowing through combobox options", () => {
  render(<ComboboxWithInlineAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  press.ArrowDown();
  expect(screen.getByLabelText("Colors")).toHaveValue("Red");
  press.ArrowDown();
  expect(screen.getByLabelText("Colors")).toHaveValue("Green");
  press.ArrowDown();
  expect(screen.getByLabelText("Colors")).toHaveValue("Blue");
  press.ArrowDown();
  expect(screen.getByLabelText("Colors")).toHaveValue("");
});

test("revert combobox value after closing combobox popover with esc", () => {
  render(<ComboboxWithInlineAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  press.ArrowUp();
  expect(screen.getByLabelText("Colors")).toHaveValue("Blue");
  press.Escape();
  expect(screen.getByLabelText("Colors")).toHaveValue("");
});

test("keep combobox value after closing combobox popover by tabbing out", () => {
  render(
    <>
      <ComboboxWithInlineAutocomplete />
      <button>button</button>
    </>
  );
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  press.Home();
  expect(screen.getByLabelText("Colors")).toHaveValue("Red");
  press.Tab();
  expect(screen.getByLabelText("Colors")).toHaveValue("Red");
});

test("keep combobox value after closing combobox popover by clicking outside", () => {
  const { baseElement } = render(<ComboboxWithInlineAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  press.End();
  expect(screen.getByLabelText("Colors")).toHaveValue("Blue");
  click(baseElement);
  expect(screen.getByLabelText("Colors")).toHaveValue("Blue");
});

test("unselect combobox option when cleaning combobox value", () => {
  render(<ComboboxWithInlineAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  focus(screen.getByText("Red"));
  expect(screen.getByLabelText("Colors")).toHaveValue("Red");
  fireEvent.change(screen.getByLabelText("Colors"), { target: { value: "" } });
  expect(screen.getByText("Red")).not.toHaveFocus();
  expect(screen.getByText("Green")).not.toHaveFocus();
  expect(screen.getByText("Blue")).not.toHaveFocus();
  expect(screen.getByLabelText("Colors")).toHaveValue("");
});
