import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("popover scroll position is preserved when items change during infinite scroll", async ({
    page,
    q,
  }) => {
    const popover = q.listbox();
    await test.expect(popover).toBeVisible();

    const combobox = q.combobox();
    await combobox.focus();

    // Scroll via mouse wheel to trigger loading more items
    await popover.hover();
    await page.mouse.wheel(0, 10000);

    // Wait for new items to load
    await test.expect
      .poll(() => popover.getByRole("option").count())
      .toBeGreaterThan(20);

    // The scroll position should not have been reset to 0 by scrollIntoView
    const scrollTop = await popover.evaluate((el) => el.scrollTop);
    test.expect(scrollTop).toBeGreaterThan(50);
  });

  test("popover scroll position is preserved on non-wheel scroll", async ({
    q,
  }) => {
    const popover = q.listbox();
    await test.expect(popover).toBeVisible();

    const combobox = q.combobox();
    await combobox.focus();

    // Scroll programmatically without a wheel event to simulate scrollbar
    // drag or other non-wheel scroll paths
    await popover.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight - 50;
    });

    // Wait for new items to load
    await test.expect
      .poll(() => popover.getByRole("option").count())
      .toBeGreaterThan(20);

    // The scroll position should not have been reset to 0 by scrollIntoView
    const scrollTop = await popover.evaluate((el) => el.scrollTop);
    test.expect(scrollTop).toBeGreaterThan(50);
  });
});
