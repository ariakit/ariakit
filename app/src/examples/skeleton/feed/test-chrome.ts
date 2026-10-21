import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// Resolves when a page of the feed starts to grow. The listener must be added
// before the click, because the growth can end before the next check.
function waitForPageGrowth(feed: Locator) {
  return feed.evaluate(
    (element: HTMLElement) =>
      new Promise<void>((resolve) => {
        element.addEventListener("transitionrun", (event) => {
          if (event.propertyName !== "max-height") return;
          resolve();
        });
      }),
  );
}

// Resolves when the pages of the feed stop growing.
function waitForPagesGrown(feed: Locator) {
  return feed.evaluate(async (element) => {
    const animations = element.getAnimations({ subtree: true });
    const growth = animations.filter(
      (animation) =>
        animation instanceof CSSTransition &&
        animation.transitionProperty === "max-height",
    );
    await Promise.all(growth.map((animation) => animation.finished));
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps loaded posts visible while more posts load", async ({ q }) => {
    await test.expect(q.text("Priya Raman")).toBeVisible();
    await q.button("Load more").click();
    await test.expect(q.status()).toHaveText("Loading posts");
    await test.expect(q.text("Priya Raman")).toBeVisible();
    await test.expect(q.text("Leo Martins")).toBeVisible();
    await test.expect(q.text("Kenji Ito")).toBeVisible();
    await test.expect(q.text("Priya Raman")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317548115
  test("keeps the layout when each page loads", async ({ q }) => {
    const feed = q.region("Feed");
    const loadMore = q.button("Load more");
    const getFeedBottom = () =>
      feed.evaluate((element) => element.getBoundingClientRect().bottom);
    for (const author of ["Ana Souza", "Maya Chen"]) {
      await test.expect(loadMore).toBeEnabled();
      await loadMore.click();
      await test.expect(q.status()).toHaveText("Loading posts");
      // The placeholders take their full height when the page stops growing,
      // before the posts load.
      await waitForPagesGrown(feed);
      const placeholdersBottom = await getFeedBottom();
      await test.expect(q.text(author)).toBeVisible();
      test.expect(await getFeedBottom()).toBe(placeholdersBottom);
    }
  });

  // A preview card in the same row follows the height of the feed, so a page
  // that takes its height at once makes that card jump.
  test("grows each new page into place", async ({ q }) => {
    const feed = q.region("Feed");
    const loadMore = q.button("Load more");
    await test.expect(loadMore).toBeEnabled();
    const growth = waitForPageGrowth(feed);
    await loadMore.click();
    await growth;
  });
});
