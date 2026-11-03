import { click, hover, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the tooltip after the text leaves the anchor", async () => {
  await hover(q.button("Settings"));
  // A tooltip would show after its hover delay of 500ms, and no state tracks
  // that delay while the tooltip stays absent.
  await sleep(600);
  expect(q.tooltip.maybe()).not.toBeInTheDocument();
  await click(q.button("Collapse the sidebar"));
  await hover(q.button("Settings"));
  expect(await q.tooltip.wait("Settings")).toBeVisible();
});
