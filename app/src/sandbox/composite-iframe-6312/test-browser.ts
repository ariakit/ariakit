import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6312
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("PageDown pages by the iframe's own scroller, not the outer page", async ({
    page,
  }) => {
    // The composite lives inside a same-origin iframe whose own document is the
    // scroller (no in-frame overflow container).
    const frame = query(page.frameLocator("iframe[title='Embedded list']"));

    await frame.button("Item 1").click();
    await test.expect(frame.button("Item 1")).toBeFocused();

    await page.keyboard.press("PageDown");

    // With a 220px iframe viewport and 50px items, one page down lands on
    // Item 7. Before the fix, paging used the outer page's much taller viewport
    // and jumped far past it.
    await test.expect(frame.button("Item 7")).toBeFocused();
  });
});
