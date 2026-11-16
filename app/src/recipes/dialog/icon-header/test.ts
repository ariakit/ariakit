import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("closes the dialog when the form is sent", async () => {
  const disclosure = q.button("Invite people");
  await click(disclosure);
  const dialog = q.dialog("Invite to Acme");
  expect(dialog).toHaveAccessibleDescription(
    /People you invite can see every project/,
  );
  expect(q.within(dialog).textbox("Email address")).toHaveFocus();
  await type("kenji@example.com");
  await press.Enter();
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});
