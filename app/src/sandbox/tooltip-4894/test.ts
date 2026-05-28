import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/4894
test("works around the crash by opening one controlled tooltip at a time", async () => {
  await click(q.button("Open first tooltip"));
  expect(q.tooltip("HELLO!")).toBeVisible();
  expect(q.tooltip("HELLO 222!")).not.toBeInTheDocument();

  await click(q.button("Open second tooltip"));
  expect(q.tooltip("HELLO!")).not.toBeInTheDocument();
  expect(q.tooltip("HELLO 222!")).toBeVisible();
});
