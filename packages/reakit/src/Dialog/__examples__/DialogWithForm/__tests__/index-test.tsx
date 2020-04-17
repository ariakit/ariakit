import * as React from "react";
import { render, fireEvent, type, wait, click } from "reakit-test-utils";
import DialogWithForm from "..";

test("should rename", async () => {
  const { getByText, getByLabelText, getByRole } = render(<DialogWithForm />);
  const name = getByText("Name");
  expect(name).toBeVisible();
  const disclosure = getByText("✏️");
  const dialog = getByLabelText("Choose a new name");
  expect(dialog).not.toBeVisible();
  click(disclosure);
  expect(dialog).toBeVisible();
  const form = getByRole("form");
  const input = getByLabelText("New name");
  type(" 2", input);
  fireEvent.submit(form);
  await wait(() => {
    expect(dialog).not.toBeVisible();
  });
  const newName = getByText("Name 2");
  expect(newName).toBeVisible();
});
