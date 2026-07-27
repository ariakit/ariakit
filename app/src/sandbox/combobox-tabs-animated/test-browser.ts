import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("restores the selected tab after the leave animation", async ({
    page,
    q,
  }) => {
    await q.combobox().click();
    await test.expect(q.dialog("Pages")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Examples 31")).toHaveAttribute("data-active-item");
    await test
      .expect(q.tab("Examples 31"))
      .toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Escape");
    await test.expect(q.combobox()).toHaveAttribute("data-active-item");
    const dialog = page.locator('[role="dialog"]');
    await test.expect(dialog).toHaveAttribute("data-leave");
    await test.expect(dialog).toHaveCount(0, { timeout: 2_000 });

    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.tab("Components 16"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Components 16")).toBeVisible();
  });

  test("reopens while the leave animation is running", async ({ page, q }) => {
    await q.combobox().click();
    await test.expect(q.dialog("Pages")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await test
      .expect(page.locator('[role="dialog"]'))
      .toHaveAttribute("data-leave");

    await page.waitForTimeout(200);
    await page.keyboard.press("ArrowDown");
    await test.expect(q.dialog("Pages")).toBeVisible();
    await test
      .expect(q.tab("Examples 31"))
      .toHaveAttribute("aria-selected", "true");
    await page.waitForTimeout(1_000);
    await test.expect(q.dialog("Pages")).toBeVisible();
    await test.expect(q.tabpanel("Examples 31")).toBeVisible();
  });
});
