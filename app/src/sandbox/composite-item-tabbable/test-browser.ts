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

  // https://github.com/ariakit/ariakit/issues/4767
  test("does not redirect focus to a non-focusable virtual focus owner", async ({
    page,
    q,
  }) => {
    const primary = q.option("Primary");
    await primary.click();
    await test.expect(primary).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const social = q.option("Social");
    await test.expect(social).toBeFocused();
    await test.expect(social).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("ArrowDown");
    const updates = q.option("Updates");
    await test.expect(updates).toBeFocused();
    await test.expect(updates).toHaveAttribute("data-focus-visible", "true");
    await test.expect(primary).not.toHaveAttribute("data-focus-visible");
    await test.expect(social).not.toHaveAttribute("data-focus-visible");
  });
});
