import { click, q } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

const options = ["Lemon", "Lime", "Orange", "Apple", "Banana"] as const;

for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
  describe(renderer, () => {
    beforeEach(async () => {
      if (renderer === "SelectRenderer") {
        await click(q.button("Use SelectRenderer"));
      }
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
    test("forwards horizontal orientation to the item layout", async () => {
      await click(q.combobox("Favorite fruit"));

      // Horizontal orientation lays items out along the x-axis: the renderer
      // offsets each item by `left` and keeps a shared `top` of 0. The last
      // option "Cherry" (index 2) lands at `itemSize * 2 = 192px`; asserting
      // the last item keeps the check robust because it stays rendered as a
      // persistent index even when virtualization trims middle items. Before
      // the fix, the dropped `orientation` prop fell back to vertical,
      // offsetting by `top` instead.
      expect(q.option("Cherry")).toHaveStyle({ left: "192px", top: "0px" });
    });
  });
}

// https://github.com/ariakit/ariakit/pull/6832
test("renders every selected value when options share a value", () => {
  const listbox = q.listbox("Duplicate selected values");
  expect(q.within(listbox).option("Selected Banana")).toBeInTheDocument();
  expect(
    q.within(listbox).option("Later duplicate Banana"),
  ).not.toBeInTheDocument();
});
