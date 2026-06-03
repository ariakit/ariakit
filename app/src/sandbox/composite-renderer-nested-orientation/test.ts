import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("uses cross-axis size for mixed-orientation nested items", () => {
  // The vertical renderer must size the horizontal group by its tallest nested
  // child (32px), not by the sum of the nested item widths. The next item's
  // offset reflects that height, so it starts 32px below the group instead of
  // far down the much wider summed width.
  expect(q.text("After group")).toHaveStyle({ top: "32px" });
});
