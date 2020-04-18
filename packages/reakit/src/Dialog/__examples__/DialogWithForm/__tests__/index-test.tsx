import * as React from "react";
import { click, focus, press, render, type, wait } from "reakit-test-utils";
import DialogWithForm from "..";

test("should rename", async () => {
  const { getByText, getByLabelText } = render(<DialogWithForm />);
  const name = getByText("Name");
  expect(name).toBeVisible();
  const disclosure = getByText("✏️");
  const dialog = getByLabelText("Choose a new name");
  expect(dialog).not.toBeVisible();
  click(disclosure);
  expect(dialog).toBeVisible();
  const input = getByLabelText("New name");
  focus(input);
  type(" 2");
  press.Enter();
  await wait(() => {
    expect(dialog).not.toBeVisible();
  });
  const newName = getByText("Name 2");
  expect(newName).toBeVisible();
});
