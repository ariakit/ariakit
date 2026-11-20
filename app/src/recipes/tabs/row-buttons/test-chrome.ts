import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("reaches the buttons of the row with the Tab key in reading order", async ({
    q,
    page,
  }) => {
    await q.button("Outline").focus();
    await page.keyboard.press("Tab");
    // The tab list is one stop, on its selected tab.
    await test.expect(q.tab("Brief")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Smaller text")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Larger text")).toBeFocused();
  });

  test("moves between tabs only with the arrow keys", async ({ q, page }) => {
    await q.tab("Brief").click();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.tab("Feedback")).toBeFocused();
    await test
      .expect(q.tab("Feedback"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Brief")).toBeFocused();
  });

  test("shows the outline without changing the selected tab", async ({ q }) => {
    await q.tab("Notes").click();
    const outline = q.button("Outline");
    await outline.click();
    await test.expect(outline).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.text("Print run")).toBeVisible();
    await test.expect(q.tab("Notes")).toHaveAttribute("aria-selected", "true");
  });
});
