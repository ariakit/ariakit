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
    // CSS draws the guide from the list structure. The thumb range stays empty
    // until the script measures the visible rows.
    await test.expect(nav.locator(".toc-link-guide").first()).toBeVisible();
    const range = await nav.evaluate((element) => {
      const style = getComputedStyle(element);
      return [
        style.getPropertyValue("--toc-thumb-start"),
        style.getPropertyValue("--toc-thumb-end"),
      ];
    });
    test.expect(range).toEqual(["0px", "0px"]);
  });
});
