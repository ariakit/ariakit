import * as React from "react";
import { render, click, type, wait, screen } from "reakit-test-utils";
import ComboboxFetch from "..";

function expectSelectionValue(element: Element, value: string) {
  const input = element as HTMLInputElement;
  const { selectionStart, selectionEnd } = input;
  const selectionValue = input.value.slice(selectionStart!, selectionEnd!);
  expect(selectionValue).toBe(value);
}

test("open combobox popover on click", async () => {
  render(<ComboboxFetch />);
  expect(screen.getByLabelText("Fruits suggestions")).not.toBeVisible();
  click(screen.getByLabelText("Fruits"));
  expect(screen.getByLabelText("Fruits suggestions")).toBeVisible();
  await wait(() => expect(screen.getByText("Acerola")).not.toHaveFocus());
});

test("type on combobox", async () => {
  render(<ComboboxFetch />);
  click(screen.getByLabelText("Fruits"));
  await wait(() => expect(screen.getByText("Acerola")).not.toHaveFocus);
  type("bl");
  await wait(() =>
    expect(screen.getByLabelText("Fruits")).toHaveValue("blackberries")
  );
  expectSelectionValue(screen.getByLabelText("Fruits"), "ackberries");
  expect(screen.getByText("Blackberries")).toHaveFocus();
  type("\b");
  await wait(() => expect(screen.getByLabelText("Fruits")).toHaveValue("b"));
  await wait(() => expect(screen.getByText("Blackberries")).not.toHaveFocus());
  await wait(() => expect(screen.getByText("Banana")).not.toHaveFocus());
});
