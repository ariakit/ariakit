import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/** Lists the bar snapshots of the running view transition. */
function getBarSnapshots(page: Page) {
  return page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => {
        const { effect } = animation;
        if (!(effect instanceof KeyframeEffect)) return null;
        return effect.pseudoElement;
      })
      .filter((name) => name?.match(/view-transition-(old|new)\(nav-bar/))
      .map((name) => name?.match(/old|new/)?.[0]),
  );
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves the bar when the old and new tabs are visible", async ({
    page,
    q,
  }) => {
    // The bar duration is a theme token. A long one keeps the transition
    // running while the test reads it.
    await page.addStyleTag({ content: ":root { --duration-bar: 30s; }" });
    await query(q.navigation("Repository")).link("Actions").click();
    await test.expect.poll(() => getBarSnapshots(page)).toContain("old");
  });

  // A captured bar paints above the page, where the scrolling row can't clip
  // it, so it would fly in from outside the row.
  test("keeps the bar of a scrolled-out tab out of the view transition", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 340, height: 500 });
    await page.addStyleTag({ content: ":root { --duration-bar: 30s; }" });
    const nav = q.navigation("Repository");
    await nav.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await query(nav).link("Settings").click();
    await test.expect.poll(() => getBarSnapshots(page)).toContain("new");
    test.expect(await getBarSnapshots(page)).not.toContain("old");
  });

  // The tabs size to their text, so a heavier current tab would push the tabs
  // after it unless its label reserves the heavier width.
  test("keeps the tab widths when another tab becomes current", async ({
    q,
  }) => {
    const nav = query(q.navigation("Repository"));
    const getWidths = () =>
      nav
        .link()
        .evaluateAll((elements) =>
          elements.map((element) => element.getBoundingClientRect().width),
        );
    const codeLabel = nav.text("Code");
    const pullRequestsLabel = nav.text("Pull requests");
    await test.expect(codeLabel).not.toHaveCSS("font-weight", "400");
    await test.expect(pullRequestsLabel).toHaveCSS("font-weight", "400");
    const widths = await getWidths();
    const pullRequests = nav.link("Pull requests 14");
    await pullRequests.click();
    await test.expect(pullRequests).toHaveAttribute("aria-current", "page");
    await test.expect(pullRequestsLabel).not.toHaveCSS("font-weight", "400");
    await test.expect(codeLabel).toHaveCSS("font-weight", "400");
    test.expect(await getWidths()).toEqual(widths);
  });
});
