import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not scroll when opening the controlled popover", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.evaluate(() => {
      document.body.style.paddingTop = "250px";
      window.scrollTo({ top: 250 });
    });
    await q.button("Review invite").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.dialog("Review meeting")).toBeVisible();
    await test.expect(q.button("Confirm")).toBeFocused();
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(250);
  });
});
