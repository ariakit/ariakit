import {
  waitForPreviewHydration,
  withFramework,
} from "#app/test-utils/preview.ts";

// The shell is the same on every route, so one route exercises it. "Nav" also
// gives the sidebar a current link whose name cannot collide with the "Nav
// fixtures" link, because every link query here is exact.
withFramework(
  import.meta.dirname,
  { route: "nav" },
  async ({ query, test }) => {
    test.describe("desktop", () => {
      // The old test resized before navigating. test.use keeps the width at
      // mount instead, so the sidebar never renders at another breakpoint
      // first.
      test.use({ viewport: { width: 1280, height: 900 } });

      test("keeps the gallery sidebar expanded", async ({ page, q }) => {
        const sidebar = q.complementary("Gallery sections");
        await test.expect(sidebar).toBeVisible();
        await test
          .expect(query(sidebar).link("Nav", { exact: true }))
          .toHaveAttribute("aria-current", "page");
        await test.expect(q.button("Open gallery sections")).toBeHidden();
        await test.expect(q.button("Collapse sidebar")).toHaveCount(0);
        await test.expect(sidebar).toHaveCSS("width", "256px");

        await query(sidebar).link("Button", { exact: true }).click();
        await test
          .expect(page)
          .toHaveURL(/\/astro\/previews\/ariakit-ui\/button\/$/);
        // aria-current comes from the server render, so it needs no hydration.
        await test
          .expect(
            query(q.complementary("Gallery sections")).link("Button", {
              exact: true,
            }),
          )
          .toHaveAttribute("aria-current", "page");
      });
    });

    test.describe("mobile", () => {
      test.use({ viewport: { width: 390, height: 844 } });

      test("opens and dismisses the gallery navigation dialog", async ({
        page,
        q,
      }) => {
        const toggle = q.button("Open gallery sections");
        await test.expect(q.complementary("Gallery sections")).toBeHidden();
        await test.expect(toggle).toHaveCSS("position", "fixed");
        await test.expect(toggle).toBeInViewport({ ratio: 1 });
        await test.expect(toggle).toHaveCSS("bottom", "16px");
        await test.expect(toggle).toHaveCSS("inset-inline-end", "16px");
        await toggle.click();
        const dialog = q.dialog("Gallery sections");
        await test.expect(dialog).toBeVisible();
        await test
          .expect(query(dialog).link("Nav", { exact: true }))
          .toHaveAttribute("aria-current", "page");

        await q.button("Close gallery sections").click();
        await test.expect(dialog).toBeHidden();
        await test.expect(toggle).toBeFocused();
        await toggle.click();
        await page.keyboard.press("Escape");
        await test.expect(dialog).toBeHidden();
        await test.expect(toggle).toBeFocused();

        await toggle.click();
        await query(dialog).link("Button", { exact: true }).click();
        await test
          .expect(page)
          .toHaveURL(/\/astro\/previews\/ariakit-ui\/button\/$/);
        // The toggle below only exists once the next route's island has
        // mounted.
        await waitForPreviewHydration(page);
        await test.expect(q.dialog("Gallery sections")).toBeHidden();
        await q.button("Open gallery sections").click();
        await test
          .expect(
            query(q.dialog("Gallery sections")).link("Button", { exact: true }),
          )
          .toHaveAttribute("aria-current", "page");
      });
    });

    test.describe("mobile below the desktop breakpoint", () => {
      test.use({ viewport: { width: 767, height: 844 } });

      test("dismisses the mobile dialog when the gallery switches to desktop", async ({
        page,
        q,
      }) => {
        await test.expect(q.complementary("Gallery sections")).toBeHidden();
        await q.button("Open gallery sections").click();
        await test.expect(q.dialog("Gallery sections")).toBeVisible();

        await page.setViewportSize({ width: 768, height: 844 });
        await test.expect(q.dialog("Gallery sections")).toBeHidden();
        const sidebar = q.complementary("Gallery sections");
        await test.expect(sidebar).toBeVisible();
        await test.expect(q.button("Open gallery sections")).toBeHidden();
        await query(sidebar).link("Button", { exact: true }).click();
        await test
          .expect(page)
          .toHaveURL(/\/astro\/previews\/ariakit-ui\/button\/$/);
      });
    });
  },
);
