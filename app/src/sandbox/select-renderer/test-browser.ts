import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const options = ["Lemon", "Lime", "Orange", "Apple", "Banana"] as const;

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/6301
  test("sets sequential option positions across groups and leaves", async ({
    q,
  }) => {
    await q.combobox("Fruit").click();

    for (const [index, name] of options.entries()) {
      const option = q.option(name);
      await test.expect(option).toHaveAttribute("aria-setsize", "5");
      await test
        .expect(option)
        .toHaveAttribute("aria-posinset", `${index + 1}`);
    }
  });

  test("SelectRenderer forwards horizontal orientation to the item layout", async ({
    q,
  }) => {
    await q.combobox("Favorite fruit").click();

    // Horizontal orientation lays items out along the x-axis: the renderer
    // offsets each item by `left` and keeps a shared `top` of 0. The last
    // option "Cherry" (index 2) lands at `itemSize * 2 = 192px`; asserting the
    // last item keeps the check robust because it stays rendered as a
    // persistent index even when virtualization trims middle items. Before the
    // fix, the dropped `orientation` prop fell back to vertical, offsetting by
    // `top` instead.
    const cherry = q.option("Cherry");
    await test.expect(cherry).toHaveCSS("left", "192px");
    await test.expect(cherry).toHaveCSS("top", "0px");
  });

  // https://github.com/ariakit/ariakit/issues/3913
  test("updates items when an initially empty scroller gains overflow", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Async items");
    const asyncOptions = query(scroller);

    await q.button("Connect scroll element").click();
    await flushFrames(page);
    await q.button("Load async items").click();
    await test.expect(asyncOptions.option("Async item 1")).toBeVisible();

    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await flushFrames(page);

    await test.expect(q.status()).toHaveText("Scroll observed: yes");
    await test.expect(asyncOptions.option("Async item 51")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3913
  test("disables viewport updates when the scroll element is null", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Async items");
    const asyncOptions = query(scroller);

    await q.button("Connect scroll element").click();
    await flushFrames(page);
    await q.button("Load async items").click();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await flushFrames(page);
    await test.expect(asyncOptions.option("Async item 51")).toBeVisible();

    await q.button("Disable scroll element and double item size").click();
    await flushFrames(page);

    await test.expect(asyncOptions.option("Async item 51")).toHaveCount(1);
    await test.expect(asyncOptions.option("Async item 26")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/issues/3913
  test("disables viewport updates when a scroll element ref resolves to null", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Async items");
    const asyncOptions = query(scroller);

    await q.button("Connect scroll element").click();
    await flushFrames(page);
    await q.button("Load async items").click();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await flushFrames(page);
    await test.expect(asyncOptions.option("Async item 51")).toBeVisible();

    await q.button("Disconnect scroll element and double item size").click();
    await flushFrames(page);

    await test.expect(asyncOptions.option("Async item 51")).toHaveCount(1);
    await test.expect(asyncOptions.option("Async item 26")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633347050
  test("auto-detects the scroller for omitted nested renderers", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Nested auto items");
    const nestedOptions = query(scroller);

    await test.expect(nestedOptions.option("Async item 1")).toBeVisible();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await flushFrames(page);

    await test.expect(nestedOptions.option("Async item 51")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633348139
  test("accepts a direct scroll element with a current property", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Direct element items");
    const directOptions = query(scroller);

    await test.expect(directOptions.option("Async item 1")).toBeVisible();
    await q.button("Use direct scroll element").click();
    await flushFrames(page);
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await flushFrames(page);

    await test.expect(directOptions.option("Async item 51")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633901198
  test("resolves an ancestor ref after the initial commit", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Initial ref items");
    const initialRefOptions = query(scroller);

    await test.expect(initialRefOptions.option("Async item 1")).toBeVisible();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await flushFrames(page);

    await test.expect(initialRefOptions.option("Async item 51")).toBeVisible();
  });
});
