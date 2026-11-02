import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("clips the longest folder first and keeps the button in the frame", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 400, height: 600 });
    const isClipped = (name: string) =>
      q
        .link(name)
        .locator(".breadcrumb-truncate")
        .evaluate((element) => element.scrollHeight > element.clientHeight);
    await test.expect.poll(() => isClipped("components")).toBe(true);
    test.expect(await isClipped("src")).toBe(false);
    test.expect(await isClipped("ui")).toBe(false);
    const inside = await q.button("Copy path").evaluate((element) => {
      const frame = element.parentElement?.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return box.right <= (frame?.right ?? 0);
    });
    test.expect(inside).toBe(true);
  });
});
