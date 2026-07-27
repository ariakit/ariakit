import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const key of ["Enter", "Space"] as const) {
    test(`keeps the menu mounted through the ${key} leave animation`, async ({
      page,
      q,
    }) => {
      const button = q.button("Options");
      await button.press(key);
      await test.expect(q.menu()).toBeVisible();
      await test.expect(q.menuitem("Edit")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await button.press(key);
      await test.expect(button).toBeFocused();
      await test
        .expect(q.menu(undefined, { includeHidden: true }))
        .toBeAttached();
      await test
        .expect(q.menu(undefined, { includeHidden: true }))
        .not.toBeAttached();
    });
  }

  test("click and Escape preserve focus while leaving", async ({ page, q }) => {
    const button = q.button("Options");
    await button.click();
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();
    await button.click();
    await test.expect(button).toBeFocused();
    await test
      .expect(q.menu(undefined, { includeHidden: true }))
      .toBeAttached();
    await test
      .expect(q.menu(undefined, { includeHidden: true }))
      .not.toBeAttached();

    await button.click();
    await page.keyboard.press("Escape");
    await test.expect(button).toBeFocused();
    await test
      .expect(q.menu(undefined, { includeHidden: true }))
      .toBeAttached();
    await test
      .expect(q.menu(undefined, { includeHidden: true }))
      .not.toBeAttached();
  });

  test("outside click starts leave without restoring focus", async ({
    page,
    q,
  }) => {
    const button = q.button("Options");
    await button.click();
    await page.mouse.click(4, 4);
    await test.expect(button).not.toBeFocused();
    await test
      .expect(q.menu(undefined, { includeHidden: true }))
      .toBeAttached();
    await test
      .expect(q.menu(undefined, { includeHidden: true }))
      .not.toBeAttached();
  });
});
