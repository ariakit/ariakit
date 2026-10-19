import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps loaded posts visible while more posts load", async ({
    page,
    q,
  }) => {
    await test.expect(q.text("Priya Raman")).toBeVisible();
    await q.button("Load more").click();
    await test.expect(q.status()).toHaveText("Loading posts");
    // The next page shows its placeholders 150 ms after the request starts, and
    // no visible state marks that moment. Cross it while the page loads.
    await page.waitForTimeout(250);
    await test.expect(q.status()).toHaveText("Loading posts");
    await test.expect(q.text("Priya Raman")).toBeVisible();
    await test.expect(q.text("Leo Martins")).toBeVisible();
    await test.expect(q.text("Kenji Ito")).toBeVisible();
    await test.expect(q.text("Priya Raman")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317548115
  test("keeps the layout when each page loads", async ({ q }) => {
    const loadMore = q.button("Load more");
    const getFeedBottom = () =>
      q
        .region("Feed")
        .evaluate((element) => element.getBoundingClientRect().bottom);
    for (const author of ["Ana Souza", "Maya Chen"]) {
      await test.expect(loadMore).toBeEnabled();
      await loadMore.click();
      await test.expect(q.status()).toHaveText("Loading posts");
      // Pending placeholders already hold their layout before they fade in.
      const placeholdersBottom = await getFeedBottom();
      await test.expect(q.text(author)).toBeVisible();
      test.expect(await getFeedBottom()).toBe(placeholdersBottom);
    }
  });
});
