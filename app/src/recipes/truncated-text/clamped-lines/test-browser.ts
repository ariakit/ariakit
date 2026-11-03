import { withFramework } from "#app/test-utils/preview.ts";
import { hoverPastShowTimeout } from "#app/test-utils/tooltip.ts";

const LONG_TITLE =
  "What three years of support tickets taught us about onboarding, pricing pages, and the emails that people actually read";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the full title only for a title that needs more lines", async ({
    page,
    q,
  }) => {
    await hoverPastShowTimeout(
      page,
      q.link("How we cut our build times in half"),
    );
    await test.expect(q.tooltip()).toHaveCount(0);
    const link = q.link(LONG_TITLE);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await test.expect(q.tooltip(LONG_TITLE)).toBeVisible();
  });
});
