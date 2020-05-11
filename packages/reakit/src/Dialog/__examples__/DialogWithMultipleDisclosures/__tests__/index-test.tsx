import * as React from "react";
import { click, press, render } from "reakit-test-utils";
import DialogWithMultipleDisclosures from "..";

test("open and close dialog with multiple disclosures", () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithMultipleDisclosures />
  );
  const dialog = label("Dialog with multiple disclosures");
  expect(dialog).not.toBeVisible();
  click(text("Disclosure 1"));
  expect(dialog).toBeVisible();
  expect(text("Close")).toHaveFocus();
  click(text("Disclosure 2"));
  expect(dialog).toBeVisible();
  expect(text("Close")).toHaveFocus();
  press.Escape();
  expect(dialog).not.toBeVisible();
  expect(text("Disclosure 2")).toHaveFocus();
  click(text("Button"));
  expect(dialog).toBeVisible();
  expect(text("Close")).toHaveFocus();
  click(text("Close"));
  expect(dialog).not.toBeVisible();
  expect(text("Button")).toHaveFocus();
});
