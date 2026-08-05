import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Box = NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>;

withFramework(import.meta.dirname, async ({ test }) => {
  test("falls back from right to top and bottom", async ({ page, q }) => {
    const disclosure = q.button("Accept invite");
    const popover = q.dialog("Team meeting");

    // Placement settles asynchronously after viewport and scroll changes, so
    // poll the geometry instead of sampling it once.
    const expectGap = (getGap: (anchor: Box, popover: Box) => number) =>
      test.expect
        .poll(async () => {
          const anchorBox = await disclosure.boundingBox();
          const popoverBox = await popover.boundingBox();
          if (!anchorBox || !popoverBox) return -Infinity;
          return getGap(anchorBox, popoverBox);
        })
        .toBeGreaterThanOrEqual(0);

    await disclosure.click();
    await test.expect(popover).toBeVisible();

    await expectGap(
      (anchor, popover) => popover.x - (anchor.x + anchor.width - 1),
    );

    await page.setViewportSize({ width: 480, height: 1024 });
    await expectGap(
      (anchor, popover) => anchor.y - (popover.y + popover.height),
    );

    await page.evaluate(() => window.scrollTo(0, 400));
    await expectGap(
      (anchor, popover) => popover.y - (anchor.y + anchor.height),
    );
  });
});
