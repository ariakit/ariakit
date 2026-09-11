import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "nav" },
  async ({ test, query }) => {
    test("marks only the link that matches the current URL", async ({ q }) => {
      const rows = query(q.navigation("Rows"));
      await test
        .expect(rows.link("Installation"))
        .toHaveAttribute("aria-current", "page");
      await test
        .expect(rows.link("Overview"))
        .not.toHaveAttribute("aria-current");
      await test.expect(rows.link("Usage")).not.toHaveAttribute("aria-current");
      // A link to a part of the current page is not the current page.
      await test
        .expect(rows.link("Options"))
        .not.toHaveAttribute("aria-current");

      // A placeholder link has no destination, so it stays out of the tab
      // order.
      const roadmap = rows.link("Roadmap");
      await test.expect(roadmap).toHaveAttribute("aria-disabled", "true");
      await test.expect(roadmap).not.toHaveAttribute("href");
      await rows.link("Usage").focus();
      await rows.link("Usage").press("Tab");
      await test.expect(roadmap).not.toBeFocused();
    });

    test("opens the section that holds the current link", async ({ q }) => {
      const nav = query(q.navigation("Disclosures"));
      await test
        .expect(nav.button("Getting started"))
        .toHaveAttribute("aria-expanded", "true");
      await test
        .expect(nav.button("Styling"))
        .toHaveAttribute("aria-expanded", "true");
      await test
        .expect(nav.button("Composition"))
        .toHaveAttribute("aria-expanded", "false");
      const current = q
        .navigation("Disclosures")
        .locator("[aria-current='page']");
      await test.expect(current).toHaveAccessibleName("Introduction");
      await test.expect(current).toBeVisible();
      await test
        .expect(current)
        .toHaveAttribute("href", "/docs/styling/introduction");
    });

    test("opens every section around a deep current link", async ({ q }) => {
      const nav = query(q.navigation("Nested disclosures"));
      await test
        .expect(nav.button("Components"))
        .toHaveAttribute("aria-expanded", "true");
      await test
        .expect(nav.button("Forms"))
        .toHaveAttribute("aria-expanded", "true");
      const checkbox = nav.link("Checkbox");
      await test.expect(checkbox).toHaveAttribute("aria-current", "page");
      await test.expect(checkbox).toBeVisible();
    });

    test("moves the current page when a sidebar link is clicked", async ({
      q,
    }) => {
      const nav = query(q.navigation("Documentation sections"));
      const current = q
        .navigation("Documentation sections")
        .locator("[aria-current='page']");
      await test.expect(current).toHaveCount(1);
      await test
        .expect(current)
        .toHaveAttribute("href", "/docs/styling/introduction");
      await nav.link("Quickstart").first().click();
      await test.expect(current).toHaveCount(1);
      await test
        .expect(current)
        .toHaveAttribute("href", "/docs/start/quickstart");
    });
  },
);
