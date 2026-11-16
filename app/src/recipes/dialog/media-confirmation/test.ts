import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("archives the projects from the alert dialog", async () => {
  const disclosure = q.button("Archive projects");
  await click(disclosure);
  const dialog = q.alertdialog("Archive 3 projects?");
  expect(q.within(dialog).button("Cancel")).toHaveFocus();
  await click(q.within(dialog).button("Archive"));
  expect(dialog).not.toBeVisible();
  expect(q.status()).toHaveTextContent("3 projects were archived");
  expect(disclosure).toHaveFocus();
});

test("closes without archiving from Cancel", async () => {
  await click(q.button("Archive projects"));
  const dialog = q.alertdialog("Archive 3 projects?");
  await click(q.within(dialog).button("Cancel"));
  expect(dialog).not.toBeVisible();
  expect(q.status()).toHaveTextContent("");
});
