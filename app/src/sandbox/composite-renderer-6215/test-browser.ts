import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6215
  //
  // Scrolling the virtualized list mounts and unmounts item nodes, and each item
  // is measured by the renderer's internal ResizeObserver. Items that scroll out
  // (or remount to a new node, or are removed when the list unmounts) must stop
  // being observed so their detached nodes aren't retained. The sandbox wraps
  // the real ResizeObserver and shows how many observed item nodes are detached
  // from the document; that count must stay at 0.
  test("does not retain detached item nodes that are no longer rendered", async ({
    page,
    q,
  }) => {
    // The scroll container has no semantic role; it's only used for scrollTop/
    // scrollHeight mechanics, not assertions.
    const scroller = page.locator(".scroller");
    const detachedCount = q.status();

    // The list renders and measures items to begin with. Anchor the pattern so
    // it doesn't also match the "Refresh items" control.
    const firstItem = q.button(/^item /).first();
    await test.expect(firstItem).toBeVisible();
    const itemHeight = await firstItem.evaluate(
      (element) => element.getBoundingClientRect().height,
    );

    // Scroll through the whole list so many item nodes mount and unmount.
    const maxScroll = await scroller.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    );
    for (let top = 0; top < maxScroll; top += 320) {
      await scroller.evaluate((element, y) => {
        element.scrollTop = y;
      }, top);
      const visibleItemIndex = Math.floor(top / itemHeight);
      await test.expect(q.button(`item ${visibleItemIndex}`)).toBeVisible();
    }
    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await test.expect(q.button("item 198")).toBeVisible();
    await scroller.evaluate((element) => {
      element.scrollTop = 0;
    });
    await test.expect(q.button("item 1")).toBeVisible();
    // The leak counter samples detached nodes on its own frame loop. Its
    // expected zero is not a positive completion state, so cross that loop
    // after the rendered item confirms the final scroll has completed.
    await flushFrames(page);

    // Scrolled-out items must have been unobserved — no detached node retained.
    await test.expect(detachedCount).toHaveText("0");

    // Re-rendering items to new nodes (same id) must unobserve the old nodes.
    await q.button("Refresh items").click();
    // Refreshing preserves every visible label, and the expected leak count is
    // still zero, so neither exposes a positive completion state to await.
    await flushFrames(page);
    await test.expect(detachedCount).toHaveText("0");

    // Unmounting the list must disconnect the observer — still nothing retained.
    await q.button("Unmount the list").click();
    await test.expect(q.button(/^item /)).toHaveCount(0);
    // The list removal is observable above, but the negative leak counter is
    // sampled on the following frames and could otherwise pass while stale.
    await flushFrames(page);
    await test.expect(detachedCount).toHaveText("0");
  });
});
