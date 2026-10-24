import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7012
  test("hovering a partially visible menubar item does not scroll", async ({
    page,
    q,
  }) => {
    await q.menuitem("File").click();
    await test.expect(q.menu("File")).toBeVisible();

    const edit = q.menuitem("Edit");
    const initialBox = await edit.boundingBox();
    if (!initialBox) {
      throw new Error("Edit menu item is not visible");
    }
    // Scrolls a quarter of the item above the viewport, wherever the preview
    // page padding places it.
    const scrollTop = Math.round(initialBox.y + initialBox.height / 4);
    await page.mouse.wheel(0, scrollTop);
    await test.expect.poll(() => page.evaluate(() => scrollY)).toBe(scrollTop);

    await test.expect(edit).not.toBeInViewport({ ratio: 1 });
    const box = await edit.boundingBox();
    if (!box) {
      throw new Error("Edit menu item is not visible");
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 8);

    await test.expect(edit).toBeFocused();
    await test.expect(q.menu("Edit")).toBeVisible();
    await test.expect.poll(() => page.evaluate(() => scrollY)).toBe(scrollTop);
  });
});
