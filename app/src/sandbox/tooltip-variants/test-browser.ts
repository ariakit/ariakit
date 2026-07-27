import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the instant tooltip on hover and focus", async ({ page, q }) => {
    const anchor = q.button("Instant anchor");
    const tooltip = q.tooltip("Instant tooltip");

    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(tooltip).not.toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(anchor).toBeFocused();
    await test.expect(tooltip).toBeVisible();
    await q.button("Bold").focus();
    await test.expect(tooltip).not.toBeVisible();
  });

  test("keeps the label tooltip open when its anchor is clicked", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Bold");
    const tooltip = q.tooltip("Bold label");

    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await anchor.click();
    await test.expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(tooltip).not.toBeVisible();
  });

  test("keeps the hover-triggered tooltip mounted during leave", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Animated anchor");
    const tooltip = q.tooltip("Animated tooltip", { includeHidden: true });

    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(tooltip).toBeAttached();
    await test.expect(tooltip).not.toBeAttached();
  });

  test("keeps the focus-triggered tooltip mounted during leave", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Animated anchor");
    const tooltip = q.tooltip("Animated tooltip", { includeHidden: true });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(anchor).toBeFocused();
    await test.expect(tooltip).toBeVisible();
    await q.button("Bold").click();
    await test.expect(tooltip).toBeAttached();
    await test.expect(tooltip).not.toBeAttached();
  });

  test("Escape from animated tooltip content restores the anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Animated anchor");
    const tooltip = q.tooltip("Animated tooltip", { includeHidden: true });
    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await tooltip.click();
    await page.keyboard.press("Escape");
    await test.expect(anchor).toBeFocused();
    await test.expect(tooltip).not.toBeAttached();
  });
});
