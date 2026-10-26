import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("follows keyboard focus and hides on Escape", async () => {
  await press.Tab();
  expect(q.link("Inbox")).toHaveFocus();
  expect(await q.tooltip.wait("Inbox")).toBeVisible();
  await press.Tab();
  expect(q.link("Calendar")).toHaveFocus();
  expect(await q.tooltip.wait("Calendar")).toBeVisible();
  expect(q.tooltip.all()).toHaveLength(1);
  await press.Escape();
  expect(q.tooltip.maybe("Calendar")).not.toBeInTheDocument();
  expect(q.link("Calendar")).toHaveFocus();
});
