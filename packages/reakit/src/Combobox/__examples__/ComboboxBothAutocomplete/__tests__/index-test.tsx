import * as React from "react";
import { render, press, focus, click, type, screen } from "reakit-test-utils";
import ComboboxBothAutocomplete from "..";

test("change combobox value by focusing on combobox options", () => {
  render(<ComboboxBothAutocomplete />);
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
  focus(screen.getByText("Acerola"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("Acerola");
});

test("change combobox value by arrowing through combobox options", () => {
  render(<ComboboxBothAutocomplete />);
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits")).toHaveValue("Acerola");
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits")).toHaveValue("Apple");
  press.ArrowDown();
  expect(screen.getByLabelText("Fruits")).toHaveValue("Apricots");
  press.Home();
  press.ArrowUp();
  expect(screen.getByLabelText("Fruits")).toHaveValue("");
});

test("filter combobox options by typing on the combobox", () => {
  render(<ComboboxBothAutocomplete />);
  press.Tab();
  type("bla");
  expect(screen.queryByText("Blackberries")).toBeInTheDocument();
  expect(screen.queryByText("Blackcurrant")).toBeInTheDocument();
});

test("display no results when there is no option match", () => {
  render(<ComboboxBothAutocomplete />);
  press.Tab();
  type("1");
  expect(screen.queryByText("No results")).toBeInTheDocument();
});
