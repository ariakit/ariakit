import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const options = ["Lemon", "Lime", "Orange", "Apple", "Banana"] as const;

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
    test.describe(renderer, () => {
      test.beforeEach(async ({ q }) => {
        if (renderer === "SelectRenderer") {
          await q.button("Use SelectRenderer").click();
        }
      });

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

      // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633347050
      test("forwards horizontal orientation to the item layout", async ({
        q,
      }) => {
        await q.combobox("Favorite fruit").click();

        // Horizontal orientation lays items out along the x-axis: the renderer
        // offsets each item by `left` and keeps a shared `top` of 0. The last
        // option "Cherry" (index 2) lands at `itemSize * 2 = 192px`; asserting
        // the last item keeps the check robust because it stays rendered as a
        // persistent index even when virtualization trims middle items. Before
        // the fix, the dropped `orientation` prop fell back to vertical,
        // offsetting by `top` instead.
        const cherry = q.option("Cherry");
        await test.expect(cherry).toHaveCSS("left", "192px");
        await test.expect(cherry).toHaveCSS("top", "0px");
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("keeps a far typeahead move in view when items have different sizes", async ({
        page,
        q,
      }) => {
        const uganda = q.option("Uganda");

        await q.combobox("Country").click();
        await test
          .expect(q.listbox("Country"))
          .not.toHaveAttribute("data-placing");

        await page.keyboard.press("u");
        await test.expect(uganda).toHaveAttribute("data-active-item");
        // The first scroll goes to an estimated offset that shows the item, so
        // an immediate check could pass before the item moves. The renderer
        // handles that scroll on the next animation frame and measures the
        // items it then renders on the frame after.
        await flushFrames(page);

        // Items that are not measured yet keep fractional estimated offsets, so
        // the ratio allows for subpixel clipping at the scroller edge.
        await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("keeps a far upward typeahead move in view when items have different sizes", async ({
        page,
        q,
      }) => {
        const denmark = q.option("Denmark");

        await q.combobox("Country").click();
        await test
          .expect(q.listbox("Country"))
          .not.toHaveAttribute("data-placing");

        // Measure the tall items at the end first, so the estimate for the
        // items near the start becomes too large.
        await page.keyboard.press("End");
        await test
          .expect(q.option("Zambia"))
          .toHaveAttribute("data-active-item");
        // The renderer drops the first window when it handles the scroll.
        await test.expect(q.option("Australia")).toHaveCount(0);
        // It then measures the items of the new window, and the measured sizes
        // move the window once more. No rendered state shows the end of those
        // two rounds, and the move below must start from measured tall items.
        await flushFrames(page);

        await page.keyboard.press("d");
        await test.expect(denmark).toHaveAttribute("data-active-item");
        // See the downward test above for these frames.
        await flushFrames(page);

        // Without the ratio, an item that is almost completely clipped at the
        // scroller edge would still count as in view.
        await test.expect(denmark).toBeInViewport({ ratio: 0.9 });
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("keeps a far selected item in view on open when items have different sizes", async ({
        page,
        q,
      }) => {
        const select = q.combobox("Country");
        const uganda = q.option("Uganda");

        // Typeahead on the closed select changes the value before the popup
        // renders its items, so the first open presents an item that the
        // renderer has not measured yet.
        await select.focus();
        await page.keyboard.press("u");
        await test.expect(select).toHaveText("Uganda");

        await select.click();
        await test
          .expect(q.listbox("Country"))
          .not.toHaveAttribute("data-placing");
        await test.expect(uganda).toHaveAttribute("data-active-item");
        // See the downward test above for these frames. Here, the first scroll
        // is the one that presents the selected item when the popup is placed.
        await flushFrames(page);

        await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
      });

      // https://github.com/ariakit/ariakit/issues/3913
      test("updates items when an initially empty scroller gains overflow", async ({
        page,
        q,
      }) => {
        const scroller = q.listbox("Async items");
        const asyncOptions = query(scroller);

        await q.button("Connect scroll element").click();
        // The empty renderer connects the explicit ref in passive effects, but
        // exposes no rendered item that can signal when those effects finish.
        await flushFrames(page);
        await q.button("Load async items").click();
        await test.expect(asyncOptions.option("Async item 1")).toBeVisible();

        await scroller.evaluate((element) => {
          element.scrollTop = 2000;
          element.dispatchEvent(new Event("scroll"));
        });

        await test
          .expect(q.status("Async scroll status"))
          .toHaveText("Scroll observed: yes");
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
        // The empty renderer connects the explicit ref in passive effects, but
        // exposes no rendered item that can signal when those effects finish.
        await flushFrames(page);
        await q.button("Load async items").click();
        await scroller.evaluate((element) => {
          element.scrollTop = 2000;
          element.dispatchEvent(new Event("scroll"));
        });
        await test.expect(asyncOptions.option("Async item 51")).toBeVisible();

        await q.button("Disable scroll element and double item size").click();
        // Disabling viewport updates intentionally leaves the rendered window
        // unchanged, so wait through the passive update before asserting that
        // absence of change.
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
        // The empty renderer connects the explicit ref in passive effects, but
        // exposes no rendered item that can signal when those effects finish.
        await flushFrames(page);
        await q.button("Load async items").click();
        await scroller.evaluate((element) => {
          element.scrollTop = 2000;
          element.dispatchEvent(new Event("scroll"));
        });
        await test.expect(asyncOptions.option("Async item 51")).toBeVisible();

        await q
          .button("Disconnect scroll element and double item size")
          .click();
        // Disconnecting viewport updates intentionally leaves the rendered
        // window unchanged, so wait through the passive update before asserting
        // that absence of change.
        await flushFrames(page);

        await test.expect(asyncOptions.option("Async item 51")).toHaveCount(1);
        await test.expect(asyncOptions.option("Async item 26")).toHaveCount(0);
      });

      // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633347050
      test("auto-detects the scroller for omitted nested renderers", async ({
        q,
      }) => {
        const scroller = q.listbox("Nested auto items");
        const nestedOptions = query(scroller);

        await test.expect(nestedOptions.option("Async item 1")).toBeVisible();
        await scroller.evaluate((element) => {
          element.scrollTop = 2000;
          element.dispatchEvent(new Event("scroll"));
        });

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
        // The renderer accepts the direct element in passive effects, but the
        // rendered window stays unchanged until the subsequent scroll.
        await flushFrames(page);
        await scroller.evaluate((element) => {
          element.scrollTop = 2000;
          element.dispatchEvent(new Event("scroll"));
        });

        await test.expect(directOptions.option("Async item 51")).toBeVisible();
      });

      // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633901198
      test("resolves an ancestor ref after the initial commit", async ({
        q,
      }) => {
        const scroller = q.listbox("Initial ref items");
        const initialRefOptions = query(scroller);

        await test
          .expect(initialRefOptions.option("Async item 1"))
          .toBeVisible();
        await scroller.evaluate((element) => {
          element.scrollTop = 2000;
          element.dispatchEvent(new Event("scroll"));
        });

        await test
          .expect(initialRefOptions.option("Async item 51"))
          .toBeVisible();
      });

      // https://github.com/ariakit/ariakit/pull/6806#discussion_r3635028432
      test("revalidates an inherited scroll target before passive updates", async ({
        q,
      }) => {
        const scroller = q.listbox("Inherited target items");
        const inheritedOptions = query(scroller);
        const mountedItems = q.status("Inherited target mounts");

        await test
          .expect(inheritedOptions.option("Async item 1"))
          .toBeVisible();
        await scroller.evaluate((element) => {
          element.scrollTop = 2000;
          element.dispatchEvent(new Event("scroll"));
        });
        await test
          .expect(inheritedOptions.option("Async item 51"))
          .toBeVisible();

        await q.button("Clear inherited target mount log").click();
        await test.expect(mountedItems).toHaveText("Mounted items: none");
        await q
          .button("Use inner scroll element and update child class")
          .click();

        await test.expect(mountedItems).toContainText(/Async item 2(?:,|$)/);
        await test
          .expect(mountedItems)
          .not.toContainText(/Async item 49(?:,|$)/);

        await q.button("Clear inherited target mount log").click();
        await test.expect(mountedItems).toHaveText("Mounted items: none");
        await q
          .button("Use outer scroll element and increase overscan")
          .click();

        await test.expect(mountedItems).toContainText(/Async item 51(?:,|$)/);
        await test
          .expect(mountedItems)
          .not.toContainText(/Async item 5(?:,|$)/);
      });
    });
  }

  // https://github.com/ariakit/ariakit/pull/6832
  test("renders every selected value when options share a value", async ({
    q,
  }) => {
    const listbox = q.listbox("Duplicate selected values");
    await test.expect(query(listbox).option("Selected Banana")).toHaveCount(1);
    await test
      .expect(query(listbox).option("Later duplicate Banana"))
      .toHaveCount(0);
  });
});
