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

    // Scroll the popover to near the bottom to trigger loading more items.
    // Dispatch a wheel event first so Ariakit knows this is user-initiated.
    await popover.evaluate((el) => {
      el.dispatchEvent(new WheelEvent("wheel", { bubbles: true }));
      el.scrollTop = el.scrollHeight - el.clientHeight - 50;
    });

    // Wait for the onScroll handler to fire and new items to render
    await page.waitForTimeout(500);

    // Verify more items were loaded
    const optionCount = await popover.getByRole("option").count();
    test.expect(optionCount).toBeGreaterThan(20);

    // The scroll position should not have been reset to 0 by scrollIntoView
    const scrollTop = await popover.evaluate((el) => el.scrollTop);
    test.expect(scrollTop).toBeGreaterThan(50);
  });
});
