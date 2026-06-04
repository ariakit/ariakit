import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("SelectRenderer forwards horizontal orientation to the item layout", async () => {
  await click(q.combobox("Favorite fruit"));
  // Horizontal orientation lays items out along the x-axis: the renderer
  // offsets each item by `left` and keeps a shared `top` of 0. The last option
  // "Cherry" (index 2) lands at `itemSize * 2 = 192px`; asserting the last item
  // keeps the check robust because it stays rendered as a persistent index even
  // when virtualization trims middle items. Before the fix, the dropped
  // `orientation` prop fell back to vertical, offsetting by `top` instead.
  expect(q.option.ensure("Cherry")).toHaveStyle({ left: "192px", top: "0px" });
});
