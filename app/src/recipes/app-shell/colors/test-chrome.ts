import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps a focused track above the sticky player", async ({ page, q }) => {
    // A short viewport puts the later tracks behind the player.
    await page.setViewportSize({ width: 1280, height: 600 });
    const tracks = query(q.main()).list();
    await query(tracks)
      .button(/Static Bloom/)
      .focus();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
    }
    const focused = query(tracks).button(/Open Window/);
    await test.expect(focused).toBeFocused();
    const [track, player] = await Promise.all([
      focused.boundingBox(),
      q.contentinfo().boundingBox(),
    ]);
    test
      .expect((track?.y ?? 0) + (track?.height ?? 0))
      .toBeLessThanOrEqual(player?.y ?? 0);
  });
});
