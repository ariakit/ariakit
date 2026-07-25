import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("brings the selected item into view when the popup starts open", async ({
    page,
    q,
  }) => {
    await test.expect(q.option("Onion")).toBeInViewport();
    await flushFrames(page, 8);

    // Nothing has been interacted with yet, so presenting the item must not
    // take focus or drag the page along with it.
    await test.expect(q.combobox("Vegetable")).not.toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("brings the selected item into view when the popup opens", async ({
    page,
    q,
  }) => {
    await q.combobox("Fruit").click();
    await test.expect(q.option("Orange")).toBeInViewport();
    await flushFrames(page, 8);

    // Bringing it into view must not drag the page along with it.
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("brings an item moved to with the keyboard to the nearest edge", async ({
    page,
    q,
  }) => {
    await q.combobox("Fruit").click();
    await test.expect(q.option("Orange")).toBeInViewport();
    await flushFrames(page, 8);

    // Three items down lands past the bottom edge, so the list has to scroll to
    // reach it and the item ends up flush against that edge.
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press("ArrowDown");
    }
    await flushFrames(page, 8);

    const pear = q.option("Pear");
    await test.expect(pear).toHaveAttribute("data-active-item");
    const listBox = await q.listbox("Fruit").boundingBox();
    const pearBox = await pear.boundingBox();
    if (!listBox) throw new Error("The list is not visible.");
    if (!pearBox) throw new Error("The option is not visible.");
    test
      .expect(
        Math.abs(pearBox.y + pearBox.height - (listBox.y + listBox.height)),
      )
      .toBeLessThan(4);
  });

  test("does not scroll the list when hovering an item", async ({
    page,
    q,
  }) => {
    await q.combobox("Fruit").click();

    const listbox = q.listbox("Fruit");
    await test.expect(q.option("Orange")).toBeInViewport();
    // Bringing the item into view spans several frames and the assertion above
    // can settle on the first of them, so the rest have to run before the
    // position is captured.
    await flushFrames(page, 8);
    const scrollTop = await listbox.evaluate((element) => element.scrollTop);

    // The item at the top edge is clipped. Bringing it fully into view is
    // exactly what block: "nearest" would do if hovering were tracked, which is
    // what makes the unchanged scroll position below meaningful. Which item
    // that is depends on where the list settled, which differs between engines,
    // so it's resolved rather than named.
    const box = await listbox.boundingBox();
    if (!box) throw new Error("The listbox is not visible.");
    // Resolved at the same point the pointer lands on below, so the two can't
    // drift onto different items if the metrics ever change.
    const hoverX = box.x + box.width / 2;
    const hoverY = box.y + 4;
    const clipped = await listbox.evaluate(
      (list, { x, y }) => {
        const option = list.ownerDocument
          .elementFromPoint(x, y)
          ?.closest('[role="option"]');
        // Only a clipped item can move, so the assertions below would be vacuous
        // for one that is already fully visible.
        if (!option) return null;
        const listTop = list.getBoundingClientRect().top;
        if (option.getBoundingClientRect().top >= listTop) return null;
        return option.textContent;
      },
      { x: hoverX, y: hoverY },
    );
    if (!clipped) throw new Error("No item is clipped by the top edge.");

    // The pointer is moved by coordinate because hovering a locator scrolls it
    // into view first, which would change the scroll position on its own. It
    // starts in the middle so the move onto the clipped item is a real pointer
    // movement, which is what makes the item active.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.move(hoverX, hoverY);

    await test.expect(q.option(clipped)).toHaveAttribute("data-active-item");

    // The scroll is deferred across a few animation frames, so the position has
    // to be given the chance to change before it can be called unchanged.
    await flushFrames(page, 8);

    test
      .expect(await listbox.evaluate((element) => element.scrollTop))
      .toBe(scrollTop);
  });
});
