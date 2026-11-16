import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("resets the filters and closes", async () => {
  const disclosure = q.button("Filter tasks");
  await click(disclosure);
  const dialog = q.dialog("Filters");
  const status = q.within(dialog).group("Status");
  await click(q.within(status).checkbox("Mine"));
  expect(q.within(status).checkbox("Mine")).toBeChecked();
  await click(q.within(dialog).button("Reset"));
  const resetStatus = q.within(dialog).group("Status");
  expect(q.within(resetStatus).checkbox("Mine")).not.toBeChecked();
  expect(q.within(resetStatus).checkbox("Any")).toBeChecked();
  await click(q.within(dialog).button("Show 24 tasks"));
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});
