import { withFramework } from "#app/test-utils/preview.ts";

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
    const scroller = q.group("Items");
    const detachedCount = q.status();

    // Let the virtualizer's scroll handler and effects settle across two frames.
    const settle = () =>
      page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );

    // The list renders and measures items to begin with.
    await test.expect(q.button("item 0")).toBeVisible();

    // Scroll through the whole list so many item nodes mount and unmount.
    const maxScroll = await scroller.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    );
    for (let top = 0; top < maxScroll; top += 320) {
      await scroller.evaluate((element, y) => {
        element.scrollTop = y;
      }, top);
      await settle();
    }
    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await settle();
    await scroller.evaluate((element) => {
      element.scrollTop = 0;
    });
    await settle();

    // Scrolled-out items must have been unobserved — no detached node retained.
    await test.expect(detachedCount).toHaveText("0");

    // Re-rendering items to new nodes (same id) must unobserve the old nodes.
    await q.button("Refresh items").click();
    await settle();
    await test.expect(detachedCount).toHaveText("0");

    // Unmounting the list must disconnect the observer — still nothing retained.
    await q.button("Unmount the list").click();
    await settle();
    await test.expect(detachedCount).toHaveText("0");
  });
});
