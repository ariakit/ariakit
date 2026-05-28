import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4213
  test("keeps keyboard navigation in sync after controlled tab selection", async ({
    page,
    q,
  }) => {
    await q.tab("Vegetables").click();
    await test.expect(q.tab("Vegetables")).toBeFocused();

    await test.expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Vegetables")).toBeFocused();

    await page.keyboard.press("ArrowRight");

    await test.expect(q.tab("Meat")).toBeFocused();
  });
});
