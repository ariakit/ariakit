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

  test("keeps the current link still while pressed", async ({ page, q }) => {
    const nav = query(q.navigation("Main"));
    const getScale = (name: string) =>
      nav.link(name).evaluate((element) => getComputedStyle(element).scale);
    const press = async (name: string) => {
      await nav.link(name).hover();
      await page.mouse.down();
    };
    await press("Projects");
    await test.expect.poll(() => getScale("Projects")).not.toBe("none");
    await page.mouse.up();
    await test
      .expect(nav.link("Projects"))
      .toHaveAttribute("aria-current", "page");
    await press("Projects");
    // The press scale eases in over 100ms, so the current link must stay at
    // full size past that.
    await page.waitForTimeout(150);
    test.expect(await getScale("Projects")).toBe("none");
    await page.mouse.up();
  });
});
