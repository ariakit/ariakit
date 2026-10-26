import { withFramework } from "#app/test-utils/preview.ts";
import { hoverPastShowTimeout } from "#app/test-utils/tooltip.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("has no tooltip while the label shows", async ({ page, q }) => {
    const share = q.button("Share");
    await test.expect(query(share).text("Share")).toBeVisible();
    await hoverPastShowTimeout(page, share);
    await test.expect(q.tooltip()).toHaveCount(0);
  });

  test("shows the label in the tooltip while it is hidden", async ({
    page,
    q,
  }) => {
    const share = q.button("Share");
    await share.focus();
    // A narrow viewport narrows the bar, and the container query hides the
    // labels.
    await page.setViewportSize({ width: 360, height: 600 });
    await test.expect(query(share).text("Share")).toBeHidden();
    // The button keeps focus when its tooltip turns on.
    await test.expect(share).toBeFocused();
    await page.mouse.move(0, 0);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await share.scrollIntoViewIfNeeded();
    await share.hover();
    await test.expect(q.tooltip("Share")).toBeVisible();
  });
});
