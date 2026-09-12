import { tabTo } from "#app/test-utils/ariakit-ui.ts";
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
    await tabTo(page, anchor);
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

  test("opens the live tooltip on hover", async ({ q }) => {
    const anchor = q.button("Publish");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    const tooltip = q.tooltip("Publish to the public site");
    await test.expect(tooltip).toBeVisible();
    // The live tooltip opens over the title of its own box, so the pointer
    // leaves for the title of the first box.
    await q.heading("Default").hover();
    await test.expect(tooltip).toBeHidden();
  });
});
