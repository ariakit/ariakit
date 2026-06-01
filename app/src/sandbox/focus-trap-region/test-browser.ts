import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("wraps backward from the first tabbable element", async ({
    page,
    q,
  }) => {
    const checkbox = q.checkbox("Trap multiple");
    await checkbox.click();
    await test.expect(checkbox).toBeFocused();

    await page.keyboard.press("Shift+Tab");

    await test.expect(q.textbox("Multi input")).toBeFocused();
  });

  test("keeps focus on a single tabbable element", async ({ page, q }) => {
    await q.checkbox("Enable single trap").click();

    const button = q.button("Single button");
    await button.click();
    await test.expect(button).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(button).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(button).toBeFocused();
  });

  test("keeps focus on an explicitly focusable empty region", async ({
    page,
    q,
  }) => {
    await q.checkbox("Enable empty trap").click();
    await q.button("Before empty").focus();

    await page.keyboard.press("Tab");

    await test.expect(q.region("Empty focus trap")).toBeFocused();
  });

  test("keeps focus when enabled changes inside the region", async ({
    page,
    q,
  }) => {
    const checkbox = q.checkbox("Trap multiple");
    await checkbox.focus();
    await test.expect(checkbox).toBeFocused();

    await page.keyboard.press("Space");
    await test.expect(checkbox).toBeChecked();
    await test.expect(checkbox).toBeFocused();

    await page.keyboard.press("Space");
    await test.expect(checkbox).not.toBeChecked();
    await test.expect(checkbox).toBeFocused();

    await page.keyboard.press("Space");
    await test.expect(checkbox).toBeChecked();
    await test.expect(checkbox).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.textbox("Multi input")).toBeFocused();
  });
});
