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
      const toggle = await q.button("Toggle navigation").boundingBox();
      const sidebarLink = await q.link("Installation").boundingBox();
      test.expect(sidebarLink?.x).toBe(toggle?.x);
    });

    test.describe("without a sidebar", () => {
      test.use({ viewport: { width: 600, height: 800 } });

      test("keeps the header and the main content on one edge", async ({
        q,
      }) => {
        const headerLink = await q.link("Acme Docs").boundingBox();
        const heading = await q.heading("Getting started").boundingBox();
        test.expect(heading?.x).toBe(headerLink?.x);
      });
    });
  });
});
