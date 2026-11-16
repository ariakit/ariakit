import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("resets the filters and closes", async ({ q }) => {
    const disclosure = q.button("Filter tasks");
    await disclosure.click();
    const dialog = q.dialog("Filters");
    const mine = query(query(dialog).group("Status")).checkbox("Mine");
    await mine.click();
    await test.expect(mine).toBeChecked();
    await query(dialog).button("Reset").click();
    await test
      .expect(query(query(dialog).group("Status")).checkbox("Mine"))
      .not.toBeChecked();
    await query(dialog).button("Show 24 tasks").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  // The sheet sits at the end edge and fills the height, inside its 8px insets.
  test("fills the height of the window at its end edge", async ({
    page,
    q,
  }) => {
    await q.button("Filter tasks").click();
    const dialog = q.dialog("Filters");
    await test.expect(dialog).toBeVisible();
    const viewport = page.viewportSize();
    await test.expect
      .poll(async () => {
        const box = await dialog.boundingBox();
        if (!box || !viewport) return null;
        return [
          Math.round(box.y),
          Math.round(viewport.height - box.y - box.height),
          Math.round(viewport.width - box.x - box.width),
        ];
      })
      .toEqual([8, 8, 8]);
  });
});
