import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("commits route-backed tabs only after manual activation", async ({
    page,
    q,
  }) => {
    const fruits = q.tab("Fruits");
    const vegetables = q.tab("Vegetables");
    const meat = q.tab("Meat");

    await test.expect(fruits).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Fruits")).toBeVisible();

    await fruits.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(vegetables).toBeFocused();
    await test.expect(fruits).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Fruits")).toBeVisible();

    await page.keyboard.press("Enter");
    await test.expect(vegetables).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Vegetables")).toBeVisible();

    await vegetables.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(meat).toBeFocused();
    await test.expect(vegetables).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Vegetables")).toBeVisible();

    await page.keyboard.press("Space");
    await test.expect(meat).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Meat")).toBeVisible();
  });
});
