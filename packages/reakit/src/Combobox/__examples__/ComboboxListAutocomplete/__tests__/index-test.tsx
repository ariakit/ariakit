import * as React from "react";
import { render, press, focus, click, type, screen } from "reakit-test-utils";
import ComboboxListAutocomplete from "..";

test("do not change combobox value by focusing on combobox options", () => {
  render(<ComboboxListAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  focus(screen.getByText("AliceBlue"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
});

test("do not change combobox value by arrowing through combobox options", () => {
  render(<ComboboxListAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  press.ArrowDown();
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  press.ArrowDown();
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  press.End();
  expect(screen.getByLabelText("Colors")).toHaveValue("");
});

test("change combobox value by clicking on the combobox option", () => {
  render(<ComboboxListAutocomplete />);
  click(screen.getByLabelText("Colors"));
  expect(screen.getByLabelText("Colors")).toHaveValue("");
  click(screen.getByText("AliceBlue"));
  expect(screen.getByLabelText("Colors")).toHaveValue("AliceBlue");
});

test("filter combobox options by typing on the combobox", () => {
  render(<ComboboxListAutocomplete />);
  press.Tab();
  type("bla");
  expect(screen.queryByText("Black")).toBeInTheDocument();
  expect(screen.queryByText("BlanchedAlmond")).toBeInTheDocument();
});

test("display no results when there is no option match", () => {
  render(<ComboboxListAutocomplete />);
  press.Tab();
  type("1");
  expect(screen.queryByText("No results")).toBeInTheDocument();
});
