import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the composer in view and the members panel above it", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const composer = q.textbox("Message");
    const footer = q.contentinfo();
    const members = q.complementary("Members");
    // The thread is taller than the viewport, so the footer would start below
    // it without sticky positioning.
    await test.expect(composer).toBeInViewport({ ratio: 1 });
    await test
      .expect(query(q.list("Messages")).listitem().last())
      .not.toBeInViewport();
    // The sticky members panel stops at the sticky footer instead of running
    // under it.
    await test.expect
      .poll(async () => {
        const [panel, bar] = await Promise.all([
          members.boundingBox(),
          footer.boundingBox(),
        ]);
        return (panel?.y ?? 0) + (panel?.height ?? 0) - (bar?.y ?? 0);
      })
      .toBeCloseTo(0, 0);
  });
});
