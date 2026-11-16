import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("moves focus to the field and back to its disclosure on Escape", async () => {
  const disclosure = q.button("Invite people");
  await click(disclosure);
  const dialog = q.dialog("Invite to Acme");
  expect(dialog).toBeVisible();
  expect(dialog).toHaveAccessibleDescription(
    /People you invite can see every project/,
  );
  expect(q.within(dialog).textbox("Email address")).toHaveFocus();
  await press.Escape();
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("closes the dialog from its close button", async () => {
  const disclosure = q.button("Invite people");
  await click(disclosure);
  const dialog = q.dialog("Invite to Acme");
  await click(q.within(dialog).button("Dismiss popup"));
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("closes the dialog when the form is sent", async () => {
  const disclosure = q.button("Invite people");
  await click(disclosure);
  const dialog = q.dialog("Invite to Acme");
  await type("kenji@example.com");
  await press.Enter();
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

// The close button is first in the DOM, but focus starts on the field. Tab
// moves to the actions, and Shift+Tab from the field moves to the close button.
test("moves focus between the field, the actions, and the close button", async () => {
  await click(q.button("Invite people"));
  const dialog = q.dialog("Invite to Acme");
  expect(q.within(dialog).textbox("Email address")).toHaveFocus();
  await press.Tab();
  expect(q.within(dialog).button("Cancel")).toHaveFocus();
  await press.Tab();
  expect(q.within(dialog).button("Send invite")).toHaveFocus();
  await press.ShiftTab();
  await press.ShiftTab();
  expect(q.within(dialog).textbox("Email address")).toHaveFocus();
  await press.ShiftTab();
  expect(q.within(dialog).button("Dismiss popup")).toHaveFocus();
});
