import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ javaScriptEnabled: false });

  test("shows the links and the guide with no current link before hydration", async ({
    q,
  }) => {
    const nav = q.navigation("On this page");
    await test.expect(query(nav).link("Basic example")).toBeVisible();
    await test.expect(nav.locator("[aria-current]")).toHaveCount(0);
    // CSS draws the guide from the list structure. The bar range stays empty
    // until the script measures the visible rows.
    await test.expect(nav.locator(".toc-link-guide").first()).toBeVisible();
    const ranges = await nav.evaluate((element) => {
      const bars = element.querySelectorAll(".toc-link-bar");
      return [...bars].map((bar) => {
        const style = getComputedStyle(bar);
        return [
          style.getPropertyValue("--nav-bar-start"),
          style.getPropertyValue("--nav-bar-end"),
        ].join(" ");
      });
    });
    test.expect(ranges.length).toBeGreaterThan(0);
    test.expect(new Set(ranges)).toEqual(new Set(["0px 0px"]));
  });
});
