import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7201
test("opens a form dialog whose control is named self", async () => {
  await click(q.button("Add coverage"));
  expect(q.dialog("Add coverage")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7201
//
// A second control named `document` makes the form answer the document lookup
// with that control instead of leaving it unanswered, which fails inside the
// same helpers for a different reason.
test("opens a form dialog whose controls are named self and document", async () => {
  await click(q.button("Add coverage with proof"));
  expect(q.dialog("Add coverage with proof")).toBeVisible();
  await click(q.button("Cancel"));
  expect(q.button("Add coverage with proof")).toHaveFocus();
});
