import { withFramework } from "#app/test-utils/preview.ts";
import { hoverPastShowTimeout } from "#app/test-utils/tooltip.ts";

const LONG_TITLE = "Pricing experiments for the self-serve plan";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the full title only for a link that cuts it off", async ({
    page,
    q,
  }) => {
    await hoverPastShowTimeout(page, q.link("Launch checklist"));
    await test.expect(q.tooltip()).toHaveCount(0);
    const link = q.link(LONG_TITLE);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await test.expect(q.tooltip(LONG_TITLE)).toBeVisible();
  });

  test("turns the tooltip off and on as the panel resizes", async ({
    page,
    q,
  }) => {
    const panel = q.region("Pinned pages");
    const link = q.link(LONG_TITLE);
    // The resize handle is native, so the test sets the width that dragging the
    // handle sets.
    await panel.evaluate((element) => {
      element.style.width = "40rem";
    });
    await hoverPastShowTimeout(page, link);
    await test.expect(q.tooltip()).toHaveCount(0);
    await panel.evaluate((element) => {
      element.style.width = "";
    });
    // The tooltip shows on the next hover, so the pointer leaves and comes
    // back.
    await q.region("Pinned pages").hover({ position: { x: 4, y: 4 } });
    await link.hover();
    await test.expect(q.tooltip(LONG_TITLE)).toBeVisible();
  });
});
