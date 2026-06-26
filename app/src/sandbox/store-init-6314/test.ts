import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6314
test("keeps sibling setup teardowns active after a stale init disposer runs", async () => {
  await press("a");
  await press("b");
  expect(q.text("A count: 1")).toBeVisible();
  expect(q.text("B count: 1")).toBeVisible();

  await click(q.button.ensure("Stop hotkey A"));
  expect(q.text("A active: no")).toBeVisible();

  await press("a");
  expect(q.text("A count: 1")).toBeVisible();

  await press("b");
  expect(q.text("B count: 2")).toBeVisible();

  await click(q.button.ensure("Hide panel A"));
  expect(q.text("A count:")).not.toBeInTheDocument();

  await press("b");
  expect(q.text("B count: 3")).toBeVisible();
});
