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

    await popover.hover();
    // Wheel scrolling triggers the fixture's next page of items.
    await page.mouse.wheel(0, 10000);

    await test.expect
      .poll(() => popover.getByRole("option").count())
      .toBeGreaterThan(20);

    // Item updates must not let `scrollIntoView` reset the popover to the top.
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

    await test.expect
      .poll(() => popover.getByRole("option").count())
      .toBeGreaterThan(20);

    // Item updates must not let `scrollIntoView` reset the popover to the top.
    const scrollTop = await popover.evaluate((el) => el.scrollTop);
    test.expect(scrollTop).toBeGreaterThan(50);
  });
});
