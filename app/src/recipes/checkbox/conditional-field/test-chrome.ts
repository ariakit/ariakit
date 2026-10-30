import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the field after the checkbox only while it is checked", async ({
    page,
    q,
  }) => {
    const field = q.textbox("Gift message");
    await test.expect(field).toHaveCount(0);
    await q.checkbox("This order is a gift").click();
    await test.expect(field).toBeVisible();
    // Focus stays on the checkbox, and Tab moves into the field next.
    await test.expect(q.checkbox("This order is a gift")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(field).toBeFocused();
    await q.checkbox("This order is a gift").click();
    await test.expect(field).toHaveCount(0);
  });
});
