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
  expect(screen.getByLabelText("Fruits")).not.toBeVisible();
  click(screen.getByLabelText("Fruit"));
  expect(screen.getByLabelText("Fruits")).toBeVisible();
  await wait(() => expect(screen.getByText("Acerola")).not.toHaveFocus());
});

test("type on combobox", async () => {
  render(<ComboboxFetch />);
  click(screen.getByLabelText("Fruit"));
  await wait(() => expect(screen.getByText("Acerola")).not.toHaveFocus());
  type("bl");
  await wait(() =>
    expect(screen.getByLabelText("Fruit")).toHaveValue("blackberries")
  );
  expectSelectionValue(screen.getByLabelText("Fruit"), "ackberries");
  expect(screen.getByText("Blackberries")).toHaveFocus();
  type("\b");
  await wait(() => expect(screen.getByLabelText("Fruit")).toHaveValue("bl"));
  await wait(() => expect(screen.getByText("Blackberries")).not.toHaveFocus());
});
