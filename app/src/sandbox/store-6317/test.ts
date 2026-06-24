import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6317
test("notifies an all-keys listener subscribed during a keyed dispatch", async () => {
  expect(q.text("No activity yet")).toBeVisible();

  await click(q.button.ensure("Like (0)"));

  expect(q.button("Like (1)")).toBeVisible();
  expect(q.text("0 -> 1")).toBeVisible();
});
