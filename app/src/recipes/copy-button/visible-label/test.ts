import { click, hover, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

test("reports the copy and keeps the name of the button", async () => {
  const copy = q.button("Copy link");
  await click(copy);
  expect(await q.status.wait("Copied")).toBeInTheDocument();
  expect(copy).toHaveAccessibleName("Copy link");
});

test("doesn't show a tooltip", async () => {
  await hover(q.button("Copy link"));
  // A tooltip would show after its hover delay of 500ms, and no state tracks
  // that delay while the tooltip stays absent.
  await sleep(600);
  expect(q.tooltip.maybe()).not.toBeInTheDocument();
});
