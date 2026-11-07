import { getCoveredWidth } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The row snaps near a card start, which would undo a scroll that reaches
  // only the focused button.
  test("scrolls a card that takes keyboard focus clear of the fades and the buttons", async ({
    page,
    q,
  }) => {
    const viewport = q.list("Integrations");
    const connect = query(viewport).button("Connect");
    const buttons = [
      q.button("Scroll backward", { includeHidden: true }),
      q.button("Scroll forward", { includeHidden: true }),
    ];
    await connect.first().focus();
    const count = await connect.count();
    for (let index = 1; index < count; index++) {
      await page.keyboard.press("Tab");
      const item = connect.nth(index);
      await test.expect(item).toBeFocused();
      await test.expect
        .poll(() => getCoveredWidth({ viewport, item, buttons }))
        .toBe(0);
    }
  });
});
