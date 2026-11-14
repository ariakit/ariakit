import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
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

  test("shows the new bar at once when the old one is scrolled out of the section", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1024, height: 420 });
    const site = q.navigation("Site");
    const nav = query(site);
    const tabs = nav.link("Tabs");
    const button = nav.link("Button");
    await tabs.scrollIntoViewIfNeeded();
    await tabs.click();
    await test.expect(tabs).toHaveAttribute("aria-current", "page");
    await test.expect(tabs.locator(".control-bar")).toBeVisible();
    // The travel time is a custom property. A long one would keep a travel on
    // its way while the test reads the bars.
    await page.addStyleTag({ content: ":root { --glider-duration: 30s; }" });
    // The section scrolls the bar of Tabs out of view. A bar that traveled from
    // there would fly over the section buttons.
    await button.scrollIntoViewIfNeeded();
    await test.expect(tabs).not.toBeInViewport();
    await button.click();
    await test.expect(button).toHaveAttribute("aria-current", "page");
    await test.expect(button.locator(".control-bar")).toBeVisible();
    await test.expect(site).not.toHaveAttribute("data-bar-traveling");
  });

  test("scrolls the page once the open section reaches its end", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1024, height: 420 });
    const nav = query(q.navigation("Site"));
    const link = nav.link("Combobox");
    const box = await link.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const getPageScroll = () => page.evaluate(() => window.scrollY);
    // The first wheel scrolls the section to its end, so later ones overscroll
    // it and chain to the page.
    await test.expect
      .poll(async () => {
        await page.mouse.wheel(0, 200);
        return getPageScroll();
      })
      .toBeGreaterThan(0);
  });
});
