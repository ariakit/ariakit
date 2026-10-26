import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8089
  test("moves the shared tooltip to the next link on hover", async ({ q }) => {
    const inbox = q.link("Inbox");
    const calendar = q.link("Calendar");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await inbox.scrollIntoViewIfNeeded();
    await inbox.hover();
    await test.expect(q.tooltip("Inbox")).toBeVisible();
    await calendar.hover();
    const tooltip = q.tooltip("Calendar");
    await test.expect(tooltip).toBeVisible();
    // The links share one tooltip element.
    await test.expect(q.tooltip()).toHaveCount(1);
    // The tooltip ends at the right side of the link, centered on it.
    await test
      .expect(async () => {
        const link = await calendar.boundingBox();
        const box = await tooltip.boundingBox();
        test.expect(link).not.toBeNull();
        test.expect(box).not.toBeNull();
        if (!link || !box) return;
        test.expect(box.x).toBeGreaterThan(link.x + link.width);
        const linkCenter = link.y + link.height / 2;
        const boxCenter = box.y + box.height / 2;
        test.expect(Math.abs(linkCenter - boxCenter)).toBeLessThan(1);
      })
      .toPass();
  });

  test("follows keyboard focus and hides on Escape", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.link("Inbox")).toBeFocused();
    await test.expect(q.tooltip("Inbox")).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(q.link("Calendar")).toBeFocused();
    await test.expect(q.tooltip("Calendar")).toBeVisible();
    await test.expect(q.tooltip()).toHaveCount(1);
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Calendar")).toBeHidden();
    await test.expect(q.link("Calendar")).toBeFocused();
  });

  test("marks the clicked section as the current page", async ({ q }) => {
    await q.link("Files").click();
    await test.expect(q.link("Files")).toHaveAttribute("aria-current", "page");
    await test.expect(q.heading("Files")).toBeVisible();
  });
});
