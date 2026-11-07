import { getCoveredWidth } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The row snaps near a card start, which would undo a scroll that reaches
  // only the focused button. In a row too narrow for a card, the middle of the
  // row would leave the button at the start of the card under a fade.
  for (const width of [undefined, 320]) {
    const title = width
      ? "scrolls a button that takes keyboard focus clear of the fades and the buttons in a row too narrow for a card"
      : "scrolls a card that takes keyboard focus clear of the fades and the buttons";
    test(title, async ({ page, q }) => {
      if (width) {
        await page.setViewportSize({ width, height: 720 });
      }
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
  }
});
