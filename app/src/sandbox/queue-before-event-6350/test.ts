import { click, hover, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6350

test("canceling a queued callback keeps it from running on the next event", async () => {
  await click(q.button.ensure("Show shortcuts"));
  const hint = q.region.ensure("Keyboard shortcuts");
  expect(hint).toBeVisible();

  await hover(hint);
  expect(q.text("Status: pinned")).toBeVisible();

  await click(q.button.ensure("New document"));
  expect(q.region("Keyboard shortcuts")).toBeVisible();
  expect(q.text("Status: pinned")).toBeVisible();
});
