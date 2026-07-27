import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6858
  test("does not lose the opening selection to immediate pointer movement", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Pointer race");
    const selected = q.option("Item 24");
    const listbox = q.listbox("Pointer race options");
    const activeItem = listbox.locator("[data-active-item]");

    const selectBox = await select.boundingBox();
    if (!selectBox) {
      throw new Error("The select is not visible.");
    }
    const selectX = selectBox.x + selectBox.width / 2;
    const selectY = selectBox.y + selectBox.height / 2;
    const listX = selectX;
    const listY = selectBox.y + selectBox.height + 12;

    // Pointer entry only intersects the vulnerable opening window, so retry the
    // complete interaction until hover actually retargets the active item.
    await test
      .expect(async () => {
        try {
          await page.mouse.move(selectX, selectY);
          await page.mouse.down();
          await page.mouse.up();
          await page.mouse.move(listX, listY);
          await flushFrames(page, 8);

          await test.expect(activeItem).toHaveCount(1);
          test.expect(await activeItem.textContent()).not.toBe("Item 24");
          await test.expect(selected).toBeInViewport();
        } finally {
          await page.keyboard.press("Escape");
          await test.expect(listbox).not.toBeVisible();
        }
      })
      .toPass({ timeout: 20_000 });
  });

  // https://github.com/ariakit/ariakit/issues/6858
  test("presents the selection when its item registers late", async ({ q }) => {
    await q.combobox("Late items").click();

    const selected = q.option("Item 24");
    await test.expect(selected).toHaveCount(0);
    await test.expect(selected).toBeVisible({ timeout: 2_000 });
    await test.expect(selected).toHaveAttribute("data-active-item");
    await test.expect(selected).toBeInViewport();
  });
});
