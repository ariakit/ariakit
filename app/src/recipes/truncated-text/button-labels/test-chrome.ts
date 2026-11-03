import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const LONG_SEARCH = "invoices from Northwind Traders paid after the due date";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the full label on keyboard focus only while it is cut off", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.button("invoices", { exact: true })).toBeFocused();
    // Keyboard focus shows a tooltip in the commit after the focus, and no
    // state tracks a tooltip that stays closed, so cross the frames that would
    // render it.
    await flushFrames(page);
    await test.expect(q.tooltip()).toHaveCount(0);
    await page.keyboard.press("Tab");
    await test.expect(q.button(LONG_SEARCH)).toBeFocused();
    await test.expect(q.tooltip(LONG_SEARCH)).toBeVisible();
  });
});
