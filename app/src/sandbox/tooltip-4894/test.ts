import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/4894
// In jsdom, this documents the stable forced-open state. The mixed test below
// fails without the re-entrant loop guard, and test-browser.ts covers the pure
// forced-open flow in a real browser.
test("keeps multiple forced tooltips visible", async () => {
  await click(q.button("Show forced tooltips"));
  expect(q.tooltip("FORCED ONE")).toBeVisible();
  expect(q.tooltip("FORCED TWO")).toBeVisible();
  expect(q.tooltip("FORCED THREE")).toBeVisible();
  expect(q.text(/Forced close requests: [1-9]\d*/)).toBeVisible();
});

test("hides controlled tooltips that accept setOpen updates", async () => {
  await click(q.button("Open managed one"));
  expect(q.tooltip("MANAGED ONE")).toBeVisible();
  expect(q.tooltip("MANAGED TWO")).not.toBeInTheDocument();

  await click(q.button("Open managed two"));
  expect(q.tooltip("MANAGED ONE")).not.toBeInTheDocument();
  expect(q.tooltip("MANAGED TWO")).toBeVisible();
});

test("keeps managed tooltips active after forced tooltips reopen", async () => {
  await click(q.button("Show forced tooltips"));
  await click(q.button("Open managed one"));
  expect(q.tooltip("MANAGED ONE")).toBeVisible();

  await click(q.button("Open managed two"));
  expect(q.tooltip("MANAGED ONE")).not.toBeInTheDocument();
  expect(q.tooltip("MANAGED TWO")).toBeVisible();
  expect(q.tooltip("FORCED ONE")).toBeVisible();
  expect(q.tooltip("FORCED TWO")).toBeVisible();
  expect(q.tooltip("FORCED THREE")).toBeVisible();
});
