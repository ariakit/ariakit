import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The tabs size to their text, so a heavier current tab would push the tabs
  // after it.
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
    const widths = await getWidths();
    const pullRequests = nav.link("Pull requests 14");
    await pullRequests.click();
    await test.expect(pullRequests).toHaveAttribute("aria-current", "page");
    test.expect(await getWidths()).toEqual(widths);
  });
});
