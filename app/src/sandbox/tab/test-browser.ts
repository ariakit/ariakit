import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("selects tabs with the keyboard", async ({ page, q }) => {
    await test
      .expect(q.tab("Vegetables"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Vegetables")).toBeVisible();

    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Meat")).toBeFocused();
    await test.expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Meat")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Fruits")).toBeFocused();
    await test.expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Fruits")).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await test.expect(q.tab("Meat")).toBeFocused();
    await test.expect(q.tabpanel("Meat")).toBeVisible();
  });

  test("selects a tab with pointer input", async ({ q }) => {
    await q.tab("Meat").click();
    await test.expect(q.tab("Meat")).toBeFocused();
    await test.expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Meat")).toBeVisible();
  });

  test("does not select a tab from focus alone", async ({ q }) => {
    await q.tab("Fruits").focus();
    await test.expect(q.tab("Fruits")).toBeFocused();
    await test
      .expect(q.tab("Vegetables"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Vegetables")).toBeVisible();
  });
});
