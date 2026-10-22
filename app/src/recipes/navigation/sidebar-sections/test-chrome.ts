import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("opens one section at a time", async ({ q }) => {
    const nav = query(q.navigation("Site"));
    await test
      .expect(nav.button("Components"))
      .toHaveAttribute("aria-expanded", "true");
    await nav.button("Examples").click();
    await test
      .expect(nav.button("Examples"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(nav.button("Components"))
      .toHaveAttribute("aria-expanded", "false");
    await test.expect(nav.link("Skeleton")).toBeVisible();
  });

  test("names a link by its label and describes it by its count", async ({
    q,
  }) => {
    const nav = query(q.navigation("Site"));
    const link = nav.link("Combobox");
    await test.expect(link).toHaveAttribute("aria-current", "page");
    await test.expect(link).toHaveAccessibleDescription("12 examples");
  });

  test("fills the sidebar with the open section and scrolls its links", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1024, height: 420 });
    const site = q.navigation("Site");
    const nav = query(site);
    const guides = nav.button("Guides");
    const navBox = await site.boundingBox();
    // The closed sections sit at the end of the sidebar, below the open one.
    await test.expect
      .poll(async () => {
        const box = await guides.boundingBox();
        if (!box || !navBox) return null;
        return Math.round(box.y + box.height - (navBox.y + navBox.height));
      })
      .toBe(0);
    // The open section is shorter than its links, so it scrolls them while the
    // page and the sidebar stay put.
    const tabs = nav.link("Tabs");
    await test.expect(tabs).not.toBeInViewport();
    await tabs.scrollIntoViewIfNeeded();
    await test.expect(tabs).toBeInViewport();
    await test.expect(guides).toBeInViewport();
    await test.expect(nav.button("Components")).toBeInViewport();
  });
});
