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

  test("shows a sent message above the sticky composer", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const messages = query(q.list("Messages"));
    await test.expect(messages.listitem().last()).not.toBeInViewport();
    await q.textbox("Message").fill("Ship it");
    await q.button("Send message").click();
    const sent = messages.listitem().last();
    await test.expect(sent).toContainText("Ship it");
    await test.expect(sent).toBeInViewport({ ratio: 1 });
    // The message ends above the composer instead of under it. Scroll offsets
    // snap to whole pixels, so a fractional gutter can leave the message less
    // than a pixel past the composer's edge.
    await test.expect
      .poll(async () => {
        const [message, bar] = await Promise.all([
          sent.boundingBox(),
          q.contentinfo().boundingBox(),
        ]);
        return (bar?.y ?? 0) - (message?.y ?? 0) - (message?.height ?? 0);
      })
      .toBeGreaterThan(-1);
  });
});
