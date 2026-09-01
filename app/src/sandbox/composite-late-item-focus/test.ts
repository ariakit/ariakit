import { click, focus, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832
test("does not refocus a late item after focus leaves the composite", async () => {
  await focus(q.button("First"));
  await press.ArrowDown();

  const mount = q.button("Mount late items");
  await click(mount);

  expect(mount).toHaveFocus();
  expect(q.button("Late")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
test("does not refocus a late item after focus leaves a virtual focus composite", async () => {
  const composite = q.listbox("Virtual actions");
  await focus(composite);
  expect(composite).toHaveFocus();

  const mount = q.button("Mount virtual late item");
  await click(mount);

  expect(q.option("Virtual late item")).toBeVisible();
  expect(mount).toHaveFocus();
  expect(q.listbox("Virtual actions")).not.toHaveFocus();
});

test("only focuses the latest item after rapid unresolved moves", async () => {
  await focus(q.button("First"));
  await press.ArrowDown();
  await press.ArrowDown();

  // Mount without moving focus out of the composite so the pending retry can
  // still focus the latest unresolved item.
  q.button("Mount late items").click();
  await sleep();

  expect(q.button("Late")).not.toHaveFocus();
  expect(q.button("Later")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7378
test("does not redirect a pending item move to the composite", async () => {
  await click(q.button("Focus unavailable action"));
  await click(q.button("Target pending toolbar"));
  await click(q.button("Hide pending toolbar"));
  await click(q.button("Show pending toolbar"));

  expect(q.button("Hide pending toolbar")).toHaveFocus();
  expect(q.toolbar("Pending actions")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7378
test("does not redirect a pending composite move to an item", async () => {
  await click(q.button("Hide pending toolbar"));
  await click(q.button("Focus pending toolbar"));
  await click(q.button("Target bold action"));
  await click(q.button("Show pending toolbar"));

  expect(q.button("Hide pending toolbar")).toHaveFocus();
  expect(q.button("Bold action")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7378
test("does not replay a pending composite move after the active id cycles", async () => {
  await click(q.button("Hide pending toolbar"));
  await click(q.button("Focus pending toolbar"));
  await click(q.button("Target bold action"));
  await click(q.button("Target pending toolbar"));
  await click(q.button("Show pending toolbar"));

  expect(q.button("Hide pending toolbar")).toHaveFocus();
  expect(q.toolbar("Pending actions")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7378
test("does not replay a pending item move after the active id cycles", async () => {
  await click(q.button("Hide pending toolbar"));
  await click(q.button("Focus pending bold action"));
  await click(q.button("Target pending toolbar"));
  await click(q.button("Target bold action"));
  await click(q.button("Show pending toolbar"));

  expect(q.button("Hide pending toolbar")).toHaveFocus();
  expect(q.button("Bold action")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7378
test("does not redirect an item move before the first composite mount", async () => {
  await click(q.button("Queue initial unavailable action"));
  await click(q.button("Show initially hidden toolbar"));

  expect(q.button("Show initially hidden toolbar")).toHaveFocus();
  expect(q.toolbar("Initially hidden actions")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7378
test("does not redirect a composite move before the first composite mount", async () => {
  await click(q.button("Queue initial toolbar"));
  await click(q.button("Show initially hidden toolbar"));

  expect(q.button("Show initially hidden toolbar")).toHaveFocus();
  expect(q.button("Initial bold action")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7378
test("does not redirect a derived composite move before the first mount", async () => {
  await click(q.button("Queue initial tab list"));
  await click(q.button("Show initially hidden tab list"));

  expect(q.button("Show initially hidden tab list")).toHaveFocus();
  expect(q.tab("Initial tab")).not.toHaveFocus();
});
