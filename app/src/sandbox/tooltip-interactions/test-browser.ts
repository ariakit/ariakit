import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows on hover, hides outside, and immediately reopens", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Tooltip anchor");
    const tooltip = q.tooltip("Tooltip content");

    await test.expect(tooltip).not.toBeVisible();
    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(tooltip).not.toBeVisible();

    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
  });

  test("stays open when hover is followed by keyboard focus", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Tooltip anchor");
    const tooltip = q.tooltip("Tooltip content");

    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(anchor).toBeFocused();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);
    await test.expect(tooltip).toBeVisible();
  });

  test("shows on focus and hides after focus moves", async ({ page, q }) => {
    const anchor = q.link("Tooltip anchor");
    const tooltip = q.tooltip("Tooltip content");

    await anchor.focus();
    await test.expect(tooltip).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(q.button("After tooltip")).toBeFocused();
    await test.expect(tooltip).not.toBeVisible();
  });

  test("stays open after focus-visible and pointer movement", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Tooltip anchor");
    const tooltip = q.tooltip("Tooltip content");

    await page.keyboard.press("Tab");
    await test.expect(anchor).toBeFocused();
    await test.expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);
    await test.expect(tooltip).toBeVisible();
    await anchor.hover();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);
    await test.expect(tooltip).toBeVisible();
  });

  test("waits again after keyboard focus is lost", async ({ page, q }) => {
    const anchor = q.link("Tooltip anchor");
    const tooltip = q.tooltip("Tooltip content");

    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(q.button("After tooltip")).toBeFocused();
    await test.expect(tooltip).not.toBeVisible();

    await page.mouse.move(0, 0);
    await anchor.hover();
    await test.expect(tooltip).not.toBeVisible();
    await test.expect(tooltip).toBeVisible();
  });

  test("Escape from tooltip content restores its anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Tooltip anchor");
    await anchor.hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    await q.tooltip("Tooltip content").click();

    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Tooltip content")).not.toBeVisible();
    await test.expect(anchor).toBeFocused();
  });
});
