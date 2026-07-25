import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/pull/6832
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps a single tab stop per composite once hydrated", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.option("Starred")).toBeFocused();

    // The containerless store never gets a composite element, so its items
    // must keep roving tabindex and skip straight to the next widget.
    await page.keyboard.press("Tab");
    await test.expect(q.listbox("Virtual focus")).toBeFocused();

    // Virtual focus options are never tab stops, so each composite element is
    // the only stop until the roving item at the end.
    await page.keyboard.press("Tab");
    await test.expect(q.listbox("Seeded")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Spam")).toBeFocused();
  });
});
