import { click, focus, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832
test("does not refocus a late item after focus leaves the composite", async () => {
  await focus(q.button("First"));
  await press.ArrowDown();

  const mount = q.button.ensure("Mount late items");
  await click(mount);

  expect(mount).toHaveFocus();
  expect(q.button("Late")).not.toHaveFocus();
});

test("only focuses the latest item after rapid unresolved moves", async () => {
  await focus(q.button("First"));
  await press.ArrowDown();
  await press.ArrowDown();

  // Mount without moving focus out of the composite so the pending retry can
  // still focus the latest unresolved item.
  q.button.ensure("Mount late items").click();
  await sleep();

  expect(q.button("Late")).not.toHaveFocus();
  expect(q.button("Later")).toHaveFocus();
});
