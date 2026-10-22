import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The links size to their text, so a heavier current link would push the
  // links after it unless its label reserves the heavier width.
  test("keeps the link widths when another link becomes current", async ({
    q,
  }) => {
    const nav = query(q.navigation("Main"));
    const getWidths = () =>
      nav
        .link()
        .evaluateAll((elements) =>
          elements.map((element) => element.getBoundingClientRect().width),
        );
    const overviewLabel = nav.text("Overview");
    const projectsLabel = nav.text("Projects");
    await test.expect(overviewLabel).not.toHaveCSS("font-weight", "400");
    await test.expect(projectsLabel).toHaveCSS("font-weight", "400");
    const widths = await getWidths();
    const projects = nav.link("Projects");
    await projects.click();
    await test.expect(projects).toHaveAttribute("aria-current", "page");
    await test.expect(projectsLabel).not.toHaveCSS("font-weight", "400");
    await test.expect(overviewLabel).toHaveCSS("font-weight", "400");
    test.expect(await getWidths()).toEqual(widths);
  });
});
