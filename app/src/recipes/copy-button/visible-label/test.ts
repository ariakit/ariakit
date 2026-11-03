import { hover, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

test("doesn't show a tooltip", async () => {
  // Without styles, the hidden feedback text is also in the name.
  await hover(q.button(/^Copy link/));
  // A tooltip would show after its hover delay of 500ms, and no state tracks
  // that delay while the tooltip stays absent.
  await sleep(600);
  expect(q.tooltip.maybe()).not.toBeInTheDocument();
});
