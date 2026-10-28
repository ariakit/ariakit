import { withFramework } from "#app/test-utils/preview.ts";

// See https://github.com/ariakit/ariakit/issues/6332
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("panel gains tabindex when switching to a tab without tabbable content", async ({
    page,
    q,
  }) => {
    const section = query(q.region("Link first"));
    await test.expect(section.tabpanel("Link")).not.toHaveAttribute("tabindex");
    await section.tab("Text").click();
    await test
      .expect(section.tabpanel("Text"))
      .toHaveAttribute("tabindex", "0");
    await page.keyboard.press("Tab");
    await test.expect(section.tabpanel("Text")).toBeFocused();
  });

  test("panel drops tabindex when switching to a tab with tabbable content", async ({
    page,
    q,
  }) => {
    const section = query(q.region("Text first"));
    await test
      .expect(section.tabpanel("Text"))
      .toHaveAttribute("tabindex", "0");
    await section.tab("Link").click();
    await test.expect(section.tabpanel("Link")).not.toHaveAttribute("tabindex");
    // The contract is that the panel element itself is skipped, not where focus
    // lands next.
    await page.keyboard.press("Tab");
    await test.expect(section.tabpanel("Link")).not.toBeFocused();
  });
});
