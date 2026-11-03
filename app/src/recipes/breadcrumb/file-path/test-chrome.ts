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

  test("says when the path can't be copied", async ({ context, page, q }) => {
    const client = await context.newCDPSession(page);
    const { targetInfo } = await client.send("Target.getTargetInfo");
    await client.send("Browser.setPermission", {
      permission: { name: "clipboard-write" },
      setting: "denied",
      origin: new URL(page.url()).origin,
      browserContextId: targetInfo.browserContextId,
    });
    const copy = q.button("Copy path");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await copy.scrollIntoViewIfNeeded();
    await copy.hover();
    await test.expect(q.tooltip("Copy path")).toBeVisible();
    await copy.click();
    await test.expect(q.tooltip("Couldn't copy the path")).toBeVisible();
    await test.expect(q.button("Couldn't copy the path")).toBeVisible();
    await test.expect(copy).toBeVisible({ timeout: 4000 });
  });

  test("copies the whole path", async ({ context, page, q }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = q.button("Copy path");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await copy.scrollIntoViewIfNeeded();
    await copy.hover();
    await test.expect(q.tooltip("Copy path")).toBeVisible();
    await copy.click();
    await test.expect(q.tooltip("Copied")).toBeVisible();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe("src/components/ui/breadcrumb.tsx");
    await test.expect(copy).toBeVisible({ timeout: 4000 });
  });
});
