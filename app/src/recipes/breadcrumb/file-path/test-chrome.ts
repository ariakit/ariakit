import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("adds no space beside a short clipped step", async ({ q }) => {
    const edges = await q
      .link("src")
      .evaluate((link) => [
        link.getBoundingClientRect().right,
        link.parentElement?.getBoundingClientRect().right,
      ]);
    test.expect(edges[1]).toBe(edges[0]);
  });

  test("keeps short folders whole at the minimum width of each step", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 280, height: 600 });
    const isClipped = (name: string) =>
      q
        .link(name)
        .locator(".breadcrumb-truncate")
        .evaluate((element) => element.scrollHeight > element.clientHeight);
    await test.expect.poll(() => isClipped("components")).toBe(true);
    // The minimum holds three characters, so these labels show all of their
    // text, and a longer one has room for a letter and the ellipsis.
    test.expect(await isClipped("src")).toBe(false);
    test.expect(await isClipped("ui")).toBe(false);
  });

  test("names the icon button with a tooltip", async ({ q }) => {
    await q.button("Copy path").hover();
    await test.expect(q.tooltip("Copy path")).toBeVisible();
  });

  test("copies the whole path", async ({ context, page, q }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.button("Copy path").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe("src/components/ui/breadcrumb.tsx");
    await test.expect(q.button("Copy path")).toBeVisible();
  });
});
