import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7012
  test("hovering a partially visible menubar item does not scroll", async ({
    page,
    q,
  }) => {
    await q.menuitem("File").click();
    await test.expect(q.menu("File")).toBeVisible();

    await page.mouse.wheel(0, 50);
    await test.expect.poll(() => page.evaluate(() => scrollY)).toBe(50);

    const edit = q.menuitem("Edit");
    await test.expect(edit).not.toBeInViewport({ ratio: 1 });
    const box = await edit.boundingBox();
    if (!box) {
      throw new Error("Edit menu item is not visible");
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 8);

    await test.expect(edit).toBeFocused();
    await test.expect(q.menu("Edit")).toBeVisible();
    await test.expect.poll(() => page.evaluate(() => scrollY)).toBe(50);
  });
});
