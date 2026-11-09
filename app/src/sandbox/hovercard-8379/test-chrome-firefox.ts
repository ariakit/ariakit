import { withFramework } from "#app/test-utils/preview.ts";

// After a scroll, Playwright WebKit sends a mousemove whose screen position
// differs from its real moves, so it moves the mouse in the frame whether a
// scroll counts as hover or not. Chrome and Firefox send no mousemove after a
// scroll, so this test runs only there.

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/8379
  test("keep the hovercard open when a frame inside it scrolls under the mouse", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const preview = query(page.frameLocator("iframe[title='Button preview']"));
    await q.link("Button").hover();
    await test.expect(card).toBeVisible();
    await query(card).heading("Button").hover();
    await preview.button("Preview button").hover();
    await page.mouse.wheel(0, 200);
    // The frame fires its scroll event before it updates what's in view.
    await test.expect(preview.button("Preview button")).not.toBeInViewport();
    // A scroll that counted as hover outside the hovercard would hide it after
    // the hide timeout, which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });
});
