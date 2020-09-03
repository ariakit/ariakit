import * as React from "react";
import { render, press, type, screen } from "reakit-test-utils";
import ComboboxBothAutoSelect from "..";

function expectSelectionValue(element: Element, value: string) {
  const input = element as HTMLInputElement;
  const { selectionStart, selectionEnd } = input;
  const selectionValue = input.value.slice(selectionStart!, selectionEnd!);
  expect(selectionValue).toBe(value);
}

test("auto select combobox option", async () => {
  render(<ComboboxBothAutoSelect />);
  press.Tab();
  type("car");
  expect(screen.getByLabelText("Fruit")).toHaveValue("carambola");
  expectSelectionValue(screen.getByLabelText("Fruit"), "ambola");
});
