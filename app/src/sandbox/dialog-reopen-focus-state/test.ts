import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("resets outside-interaction focus tracking when reopened", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  // Mark the dialog as interacted-with by focusing a field inside it, then
  // close and reopen it.
  await click(q.textbox("Inside field"));
  expect(q.textbox("Inside field")).toHaveFocus();
  await click(q.button("Close dialog"));
  await expect.poll(q.dialog.hidden.lazy("Dialog")).not.toBeVisible();

  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  // Revealing the outside field moves focus to a brand-new node outside the
  // dialog. Because reopening reset the "was focused inside" flag, this counts
  // as interacting outside and closes the dialog.
  await click(q.button("Reveal outside field"));
  expect(q.textbox("Dynamic outside field")).toHaveFocus();
  await expect.poll(q.dialog.hidden.lazy("Dialog")).not.toBeVisible();
});
