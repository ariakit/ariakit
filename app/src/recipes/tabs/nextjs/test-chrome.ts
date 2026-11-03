import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ id, test }) => {
  test("follows the route of a clicked tab", async ({ page, q }) => {
    await test.expect(q.tabpanel("Inbox")).toBeVisible();
    await q.tab("Sent").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/sent$`));
    await test
      .expect(q.tabpanel("Sent"))
      .toHaveText("You sent two messages today.");
    await test.expect(q.tab("Sent")).toBeFocused();
  });

  test("moves with the arrow keys and follows the link on Enter", async ({
    page,
    q,
  }) => {
    await q.tab("Inbox").press("ArrowRight");
    await test.expect(q.tab("Sent")).toBeFocused();
    await test.expect(page).toHaveURL(new RegExp(`/${id}$`));
    await test.expect(q.tabpanel("Inbox")).toBeVisible();

    await page.keyboard.press("Enter");
    await test.expect(page).toHaveURL(new RegExp(`/${id}/sent$`));
    await test.expect(q.tabpanel("Sent")).toBeVisible();
    await test.expect(q.tab("Sent")).toBeFocused();
  });

  test("adds one history entry for each selected tab", async ({ page, q }) => {
    await q.tab("Sent").click();
    await test.expect(q.tabpanel("Sent")).toBeVisible();
    await q.tab("Drafts").click();
    await test.expect(q.tabpanel("Drafts")).toBeVisible();
    await page.goBack();
    await test.expect(q.tabpanel("Sent")).toBeVisible();
    await page.goBack();
    await test.expect(q.tabpanel("Inbox")).toBeVisible();
    await page.goForward();
    await test.expect(q.tabpanel("Sent")).toBeVisible();
  });

  test("shows the selected tab after a reload", async ({ page, q }) => {
    await q.tab("Drafts").click();
    await test.expect(q.tabpanel("Drafts")).toBeVisible();
    await page.reload();
    await test.expect(q.tab("Drafts")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Drafts")).toBeVisible();
  });
});
