import { withFramework } from "#app/test-utils/preview.ts";
import { hoverPastShowTimeout } from "#app/test-utils/tooltip.ts";

const LONG_NAME = "Roadmap for the second half of the year";
const LONG_TEXT = "Quarterly revenue by region and product line";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the tooltip after a child component renders text that is cut off", async ({
    page,
    q,
  }) => {
    await hoverPastShowTimeout(page, q.link("Roadmap"));
    await test.expect(q.tooltip()).toHaveCount(0);
    await q.button("Rename the document").click();
    const link = q.link(LONG_NAME);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await test.expect(q.tooltip(LONG_NAME)).toBeVisible();
  });

  test("shows the tooltip after the text leaves the anchor", async ({
    page,
    q,
  }) => {
    await hoverPastShowTimeout(page, q.button("Settings"));
    await test.expect(q.tooltip()).toHaveCount(0);
    await q.button("Collapse the sidebar").click();
    const settings = q.button("Settings");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await settings.scrollIntoViewIfNeeded();
    await settings.hover();
    await test.expect(q.tooltip("Settings")).toBeVisible();
  });

  test("shows the tooltip while the text is hidden", async ({ page, q }) => {
    await hoverPastShowTimeout(page, q.button("Notifications"));
    await test.expect(q.tooltip()).toHaveCount(0);
    await q.button("Hide the label").click();
    const notifications = q.button("Notifications");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await notifications.scrollIntoViewIfNeeded();
    await notifications.hover();
    await test.expect(q.tooltip("Notifications")).toBeVisible();
  });

  test("gives static text a tab stop only while it is cut off", async ({
    page,
    q,
  }) => {
    await q.button("Hide the label").focus();
    await page.keyboard.press("Tab");
    // The tooltip repeats the text in a portal after the anchor.
    const text = q.text(LONG_TEXT).first();
    await test.expect(text).toBeFocused();
    await test.expect(q.tooltip(LONG_TEXT)).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(text).not.toBeFocused();
    // Glyphs that overflow a tight line don't cut the text off.
    await test.expect(q.text("Gross margin").first()).not.toBeFocused();
    await test.expect(q.text("Revenue").first()).not.toBeFocused();
  });
});
