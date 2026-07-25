import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// WebKit doesn't scroll a newly focused element into view, so it keeps the
// nearest edge and only these two engines center the selection.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6838
  test("centers the selected item when the popup opens", async ({
    page,
    q,
  }) => {
    await q.combobox("Fruit").click();
    await test.expect(q.option("Orange")).toBeInViewport();
    await flushFrames(page, 8);

    const listBox = await q.listbox("Fruit").boundingBox();
    const orangeBox = await q.option("Orange").boundingBox();
    if (!listBox) throw new Error("The list is not visible.");
    if (!orangeBox) throw new Error("The option is not visible.");
    // Scrolling to the nearest edge would leave the item flush against the
    // bottom of the list instead.
    test
      .expect(listBox.y + listBox.height - (orangeBox.y + orangeBox.height))
      .toBeGreaterThan(8);
  });
});
