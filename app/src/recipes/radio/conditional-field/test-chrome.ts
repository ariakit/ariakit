import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the field after the group only while Other is checked", async ({
    page,
    q,
  }) => {
    const field = q.textbox("Where did you hear about us?");
    await test.expect(field).toHaveCount(0);
    await q.radio("Other").click();
    await test.expect(field).toBeVisible();
    // Focus stays on the radio, and Tab moves into the field next.
    await test.expect(q.radio("Other")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(field).toBeFocused();
    await q.radio("Social media").click();
    await test.expect(field).toHaveCount(0);
  });
});
