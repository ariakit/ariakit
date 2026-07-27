import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("moves through a disabled tab without selecting it", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.tab("Vegetables")).toBeFocused();
    await test
      .expect(q.tab("Vegetables"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Vegetables")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Meat")).toBeFocused();
    await test.expect(q.tab("Meat")).toHaveAttribute("aria-selected", "false");
    await test.expect(q.tabpanel("Meat")).not.toBeVisible();
    await test
      .expect(q.tab("Vegetables"))
      .toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Fruits")).toBeFocused();
    await test.expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Fruits")).toBeVisible();
  });
});
