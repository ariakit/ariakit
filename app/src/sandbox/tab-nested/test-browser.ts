import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps nested tab selection independent", async ({ page, q }) => {
    await test
      .expect(q.tab("Documentation"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("npm")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("npm")).toBeVisible();

    await q.tab("yarn").click();
    await test.expect(q.tab("yarn")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("yarn")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("pnpm")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("pnpm")).toBeVisible();

    await q.tab("Reference").click();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.tabpanel("pnpm")).toBeVisible();
  });
});
