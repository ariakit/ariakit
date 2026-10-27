import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("outlines the terms below the dialog title", async () => {
  await click(q.button("Read the terms"));
  const dialog = q.within(q.dialog("Terms of service"));
  expect(dialog.heading("Terms of service", { level: 1 })).toBeVisible();
  expect(dialog.heading("Accounts", { level: 2 })).toBeVisible();
});
