import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  // Items must keep their native tab order before hydration so keyboard users
  // can reach them while JavaScript is still loading. This includes virtual
  // focus items, whose composite element is not published yet either.
  // https://github.com/ariakit/ariakit/pull/2601
  // https://github.com/ariakit/ariakit/pull/6832
  test("keeps items tabbable before hydration", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.option("Starred")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Snoozed")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Inbox")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Archive")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Primary")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Social")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Updates")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Drafts")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Sent")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Spam")).toBeFocused();
  });
});
