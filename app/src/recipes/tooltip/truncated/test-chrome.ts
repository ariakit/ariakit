import { withFramework } from "#app/test-utils/preview.ts";
import {
  hoverPastShowTimeout,
  SHOW_TIMEOUT,
  watchOpening,
} from "#app/test-utils/tooltip.ts";

const LONG_NAME = "Design review notes for the new onboarding flow";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the full text of a link that cuts it off", async ({ q }) => {
    const link = q.link(LONG_NAME);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await test.expect(q.tooltip(LONG_NAME)).toBeVisible();
  });

  test("has no tooltip for a link that shows all of its text", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.link("Roadmap")).toBeFocused();
    await hoverPastShowTimeout(page, q.link("Roadmap"));
    await test.expect(q.tooltip()).toHaveCount(0);
  });

  // Empty content keeps the anchor, which can still get focus and hover, but it
  // must not open a tooltip that the next tooltip skips its delay for.
  test("keeps the show delay after a link without a tooltip", async ({
    page,
    q,
  }) => {
    const link = q.link(LONG_NAME);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    const opening = await watchOpening(link, LONG_NAME);
    // The hover must come within the 300ms that a closed tooltip stays active,
    // so the focus check waits until after it.
    await page.keyboard.press("Tab");
    await link.hover();
    await test.expect(q.link("Roadmap")).toBeFocused();
    const { delay } = await opening();
    test.expect(delay).toBeGreaterThanOrEqual(SHOW_TIMEOUT);
  });
});
