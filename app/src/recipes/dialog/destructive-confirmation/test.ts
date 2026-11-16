import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("starts on Cancel and closes on Escape without deleting", async () => {
  const disclosure = q.button("Delete project");
  await click(disclosure);
  const dialog = q.alertdialog("Delete “Website redesign”?");
  expect(q.within(dialog).button("Cancel")).toHaveFocus();
  await press.Escape();
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
  expect(q.status()).toHaveTextContent("");
});

test("deletes the project and keeps focus on the disabled button", async () => {
  const disclosure = q.button("Delete project");
  await click(disclosure);
  const dialog = q.alertdialog("Delete “Website redesign”?");
  await click(q.within(dialog).button("Delete"));
  expect(dialog).not.toBeVisible();
  expect(q.status()).toHaveTextContent("Website redesign was deleted");
  expect(disclosure).toHaveAttribute("aria-disabled", "true");
  expect(disclosure).toHaveFocus();
});
