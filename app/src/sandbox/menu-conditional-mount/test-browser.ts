import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// menu-default-open covers the page-load opening, where no element owns focus.

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/2946
  test("takes focus when the menu mounts already open", async ({ q }) => {
    await q.button("Add item").click();

    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();
    await test
      .expect(q.menuitem("Rename"))
      .not.toHaveAttribute("data-active-item");
  });

  // A modal menu already takes focus today, but onto the first item.
  // https://github.com/ariakit/ariakit/issues/2946#issuecomment-4977621514
  // #2946 redefines that for both modal modes: the container takes focus and
  // nothing is highlighted.
  // https://github.com/ariakit/ariakit/issues/2946
  test("focuses the container when a modal menu mounts already open", async ({
    q,
  }) => {
    await q.button("Add modal item").click();

    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();
    await test
      .expect(q.menuitem("Rename"))
      .not.toHaveAttribute("data-active-item");
  });

  // Whether an item stays highlighted while focus is declined is deliberately
  // not pinned here, because nothing has decided that yet.
  // https://github.com/ariakit/ariakit/issues/2946
  test("leaves focus alone when the menu opts out", async ({ page, q }) => {
    const add = q.button("Add quiet item");
    await add.click();

    await test.expect(q.menu()).toBeVisible();
    // The dialog schedules its focus in an effect and a microtask, so let those
    // frames pass before asserting that focus never moved.
    await flushFrames(page);
    await test.expect(add).toBeFocused();
  });
});
