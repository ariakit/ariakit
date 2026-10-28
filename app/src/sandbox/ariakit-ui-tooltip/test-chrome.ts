import { tabInto } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The tooltips held open in this sandbox mark every tooltip that already
  // exists when they open as outside them, and Ariakit then ignores Escape on
  // it. The live tooltip mounts on open to avoid the marks, and this test
  // guards that it still closes on Escape.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live tooltip on Escape while others are held open", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Publish");
    // Tabs in from the previous stop. Focusing the anchor first, as tabTo does,
    // opens the tooltip and Shift+Tab closes it. The tooltip then stays visible
    // in its exit transition, so the visibility check below could pass before
    // the Tab opened it, and the late open would follow Escape.
    // https://github.com/ariakit/ariakit/issues/8109
    await tabInto(page, q.article("Hover or focus"));
    await test.expect(anchor).toBeFocused();
    const tooltip = q.tooltip("Publish to the public site");
    await test.expect(tooltip).toBeVisible();
    // The tooltip renders in a portal, outside its box.
    await test
      .expect(query(q.article("Hover or focus")).tooltip())
      .toHaveCount(0);
    await page.keyboard.press("Escape");
    await test.expect(tooltip).toBeHidden();
    await test.expect(anchor).toBeFocused();
    // The held tooltips ignore Escape and stay open.
    await test.expect(q.tooltip("Save changes")).toBeVisible();
  });
});
