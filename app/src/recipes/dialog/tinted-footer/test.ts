import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("closes the dialog when the form is sent", async () => {
  const disclosure = q.button("Invite people");
  await click(disclosure);
  const dialog = q.dialog("Invite to Acme");
  expect(q.within(dialog).textbox("Email address")).toHaveFocus();
  await type("kenji@example.com");
  await press.Enter();
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("closes the dialog from Cancel", async () => {
  const disclosure = q.button("Invite people");
  await click(disclosure);
  const dialog = q.dialog("Invite to Acme");
  await click(q.within(dialog).button("Cancel"));
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});
