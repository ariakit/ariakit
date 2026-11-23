import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import {
  largestStyleRecalculation,
  totalStyleRecalculation,
} from "#app/test-utils/style.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page }) => {
    // Size containers move style work into layout, where Chrome omits the
    // element count. Remove that boundary and motion for this count-only probe.
    await page.addStyleTag({
      content:
        "* { container-type: normal !important; transition: none !important; }",
    });
    // The probe stylesheet must finish its own invalidation before tracing.
    await flushFrames(page);
  });

  // A :has() check on an ancestor of the tabs that reads the pointer state of a
  // tab, such as `.tabs:has(… :hover) > &`, restyles that ancestor's subtree on
  // each hover. A :has() before a universal selector anywhere in the stylesheet
  // makes it the whole subtree, panels included.
  test("keeps the panel styles cached when a tab is hovered", async ({
    page,
    q,
  }) => {
    const limit = (await page.locator("*").count()) / 10;
    const count = await largestStyleRecalculation(page, () =>
      q.tab("Onboarding").hover(),
    );
    await test
      .expect(q.tab("Onboarding").locator("xpath=preceding-sibling::*[1]"))
      .toHaveCSS("opacity", "0");
    test.expect(count).toBeLessThan(limit);
  });

  // The same rules restyle those subtrees on each frame of a tab change, as the
  // panels show and hide and the glider travels, when a :has() reads the
  // selected tab or the hidden panels.
  test("keeps most styles cached when a tab is selected", async ({
    page,
    q,
  }) => {
    const limit = (await page.locator("*").count()) / 2;
    const count = await totalStyleRecalculation(page, async () => {
      await q.tab("Sales").click();
      await test.expect(q.tabpanel("Sales")).toBeVisible();
      await test.expect(q.tabpanel("Support")).toBeHidden();
    });
    test.expect(count).toBeLessThan(limit);
  });
});
