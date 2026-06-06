import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("SelectRenderer forwards horizontal orientation to the item layout", async ({
    q,
  }) => {
    await q.combobox("Favorite fruit").click();

    // Horizontal orientation lays items out along the x-axis: the renderer
    // offsets each item by `left` and keeps a shared `top` of 0. The last option
    // "Cherry" (index 2) lands at `itemSize * 2 = 192px`; asserting the last item
    // keeps the check robust because it stays rendered as a persistent index even
    // when virtualization trims middle items. Before the fix, the dropped
    // `orientation` prop fell back to vertical, offsetting by `top` instead.
    const cherry = q.option("Cherry");
    await test.expect(cherry).toHaveCSS("left", "192px");
    await test.expect(cherry).toHaveCSS("top", "0px");
  });
});
