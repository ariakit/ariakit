import { click, q } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

// Registered by the consolidated test entry point.
const options = ["Lemon", "Lime", "Orange", "Apple", "Banana"] as const;

describe("select-renderer", () => {
  beforeEach(async () => {
    await click(q.button("Show select-renderer"));
  });

  // https://github.com/ariakit/ariakit/issues/6301
  test("sets sequential option positions across groups and leaves", async () => {
    await click(q.combobox("Fruit"));

    for (const [index, name] of options.entries()) {
      const option = q.option(name);
      expect(option).toHaveAttribute("aria-setsize", "5");
      expect(option).toHaveAttribute("aria-posinset", `${index + 1}`);
    }
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633347050
  test("SelectRenderer forwards horizontal orientation to the item layout", async () => {
    await click(q.combobox("Favorite fruit"));

    // Horizontal orientation lays items out along the x-axis: the renderer
    // offsets each item by `left` and keeps a shared `top` of 0. The last option
    // "Cherry" (index 2) lands at `itemSize * 2 = 192px`; asserting the last item
    // keeps the check robust because it stays rendered as a persistent index even
    // when virtualization trims middle items. Before the fix, the dropped
    // `orientation` prop fell back to vertical, offsetting by `top` instead.
    expect(q.option("Cherry")).toHaveStyle({ left: "192px", top: "0px" });
  });
});
