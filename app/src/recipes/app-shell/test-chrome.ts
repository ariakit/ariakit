import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("collapses and restores the navigation sidebar", async ({ q }) => {
    const toggle = q.button("Toggle navigation");
    await test.expect(q.navigation("Guides")).toBeVisible();
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.navigation("Guides")).not.toBeVisible();
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.navigation("Guides")).toBeVisible();
  });

  // Three spacing steps are 10.5px at the default shell size. The header, the
  // sidebar, and the main gutter must all round them the same way.
  // https://github.com/ariakit/ariakit/issues/8179
  test.describe("at the default shell size", () => {
    test("keeps the header and the sidebar rows on one edge", async ({ q }) => {
      const toggle = q.button("Toggle navigation");
      const sidebarLink = q.link("Installation");
      await test.expect(toggle).toBeVisible();
      await test.expect(sidebarLink).toBeVisible();
      const toggleBox = await toggle.boundingBox();
      const sidebarLinkBox = await sidebarLink.boundingBox();
      test.expect(sidebarLinkBox?.x).toBe(toggleBox?.x);
    });

    test.describe("without a sidebar", () => {
      test.use({ viewport: { width: 600, height: 800 } });

      test("keeps the header and the main content on one edge", async ({
        q,
      }) => {
        const headerLink = q.link("Acme Docs");
        const heading = q.heading("Getting started");
        await test.expect(headerLink).toBeVisible();
        await test.expect(heading).toBeVisible();
        const headerLinkBox = await headerLink.boundingBox();
        const headingBox = await heading.boundingBox();
        test.expect(headingBox?.x).toBe(headerLinkBox?.x);
      });
    });
  });
});
