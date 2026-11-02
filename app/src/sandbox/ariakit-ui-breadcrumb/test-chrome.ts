import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("always hides a shy mark beside a hover surface", async ({ q }) => {
    const trail = q.navigation("Always shy in a wide gap");
    const mark = trail.locator("li[aria-hidden]");
    await test.expect(mark).toHaveCSS("opacity", "1");
    await query(trail).link("Garden").hover();
    await test.expect(mark).toHaveCSS("opacity", "0");
  });

  test("never hides a mark that isn't shy", async ({ page, q }) => {
    const trail = q.navigation("Never shy in a small gap");
    await query(trail).link("Garden").hover();
    // A hiding mark would start its 200ms transition here. No state tracks a
    // mark that stays, so wait past the transition before the assertion.
    await page.waitForTimeout(300);
    await test
      .expect(trail.locator("li[aria-hidden]"))
      .toHaveCSS("opacity", "1");
  });

  test("adds no space beside a clipped label narrower than the minimum", async ({
    q,
  }) => {
    const extra = await q
      .link("il")
      .locator(".breadcrumb-truncate")
      .evaluate((element) => {
        const range = element.ownerDocument.createRange();
        range.selectNodeContents(element);
        const text = range.getBoundingClientRect().width;
        return element.getBoundingClientRect().width - text;
      });
    test.expect(extra).toBeLessThan(1);
  });

  test("lets a link set its own ink", async ({ q }) => {
    const color = await q
      .link("Default ink")
      .evaluate((element) => getComputedStyle(element).color);
    await test.expect(q.link("Default ink")).toHaveCSS("color", color);
    await test.expect(q.link("Full ink")).not.toHaveCSS("color", color);
  });

  test("marks only the link of the current URL", async ({ q }) => {
    const trail = query(q.navigation("Current page as a link"));
    await test
      .expect(trail.link("Tools"))
      .toHaveAttribute("aria-current", "page");
    await test.expect(trail.link("Garden")).not.toHaveAttribute("aria-current");
  });
});
