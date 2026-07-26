import { click, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832
test("does not refocus a late item after focus leaves the composite", async () => {
  const first = q.button.ensure("First");
  first.focus();
  await press.ArrowDown();

  const mount = q.button.ensure("Mount late items");
  mount.focus();
  await click(mount);

  expect(mount).toHaveFocus();
  expect(q.button("Late")).not.toHaveFocus();
});

test("only focuses the latest item after rapid unresolved moves", async () => {
  const first = q.button.ensure("First");
  first.focus();
  await press.ArrowDown();
  await press.ArrowDown();

  q.button.ensure("Mount late items").click();
  await sleep();

  expect(q.button("Late")).not.toHaveFocus();
  expect(q.button("Later")).toHaveFocus();
});
