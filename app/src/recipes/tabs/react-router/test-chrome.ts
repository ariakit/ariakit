import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("adds one history entry for each selected tab", async ({ q }) => {
    await q.tab("Sent").click();
    await test
      .expect(q.tabpanel("Sent"))
      .toHaveText("You sent two messages today.");
    await q.tab("Drafts").click();
    await test
      .expect(q.tabpanel("Drafts"))
      .toHaveText("One draft waits for your review.");
    await q.button("Back").click();
    await test.expect(q.tabpanel("Sent")).toBeVisible();
    await q.button("Back").click();
    await test.expect(q.tabpanel("Inbox")).toBeVisible();
  });

  test("moves with the arrow keys and follows the link on Enter", async ({
    q,
    page,
  }) => {
    await q.tab("Inbox").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Sent")).toBeFocused();
    await test.expect(q.tab("Inbox")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Drafts")).toBeFocused();
    await test.expect(q.tabpanel("Inbox")).toBeVisible();

    await page.keyboard.press("Enter");
    await test.expect(q.tabpanel("Drafts")).toBeVisible();
    await test.expect(q.text("/drafts")).toBeVisible();
    await test.expect(q.tab("Drafts")).toBeFocused();
    // The arrow keys added no entries, so one step goes back to the first tab.
    await q.button("Back").click();
    await test.expect(q.tabpanel("Inbox")).toBeVisible();
  });

  test("renders links with the href of each route", async ({ q }) => {
    await test.expect(q.tab("Sent")).toHaveAttribute("href", "/sent");
  });
});
