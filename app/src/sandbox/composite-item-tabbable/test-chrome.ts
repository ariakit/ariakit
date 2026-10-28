import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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
