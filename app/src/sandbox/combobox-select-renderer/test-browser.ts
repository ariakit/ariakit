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

      // https://github.com/ariakit/ariakit/issues/7628
      test("keeps a far selected item in view on open when the popup has a scale transition", async ({
        page,
        q,
      }) => {
        const select = q.combobox("Animated country");
        const listbox = q.listbox("Animated country");
        const uganda = q.option("Uganda");

        // See the test above for the typeahead on the closed select.
        await select.focus();
        await page.keyboard.press("u");
        await test.expect(select).toHaveText("Uganda");

        await select.click();
        await test.expect(listbox).not.toHaveAttribute("data-placing");
        await test.expect(uganda).toHaveAttribute("data-active-item");
        // The popup is smaller than its layout size while its transition runs,
        // so its rectangles and its scroll positions have different units when
        // the renderer measures the first items. The transition ends at the
        // layout size.
        await test
          .expect(listbox)
          .toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
        // See the downward test above for these frames.
        await flushFrames(page);

        await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
      });

      for (const gesture of ["wheel", "touchmove"]) {
        // https://github.com/ariakit/ariakit/issues/7628
        test(`does not adjust the scroll position after a ${gesture} scroll by the user`, async ({
          page,
          q,
        }) => {
          const listbox = q.listbox("Country");
          const romania = q.option("Romania");

          await q.combobox("Country").click();
          await test.expect(listbox).not.toHaveAttribute("data-placing");
          await page.keyboard.press("u");
          await test
            .expect(q.option("Uganda"))
            .toHaveAttribute("data-active-item");
          // See the downward test above for these frames.
          await flushFrames(page);

          // The far move leaves measured items around Uganda. Each move up from
          // there measures one more item, so the fifth move puts the active
          // item at the top edge, below items that are not measured.
          const names = ["Turkey", "Thailand", "Sweden", "Spain", "Romania"];
          for (const name of names) {
            const option = q.option(name);
            // A move up needs the item above the active item. The renderer
            // renders that item on the frame after the list scrolls.
            await test.expect(option).toBeAttached();
            await page.keyboard.press("ArrowUp");
            await test.expect(option).toHaveAttribute("data-active-item");
          }
          await test.expect(romania).toBeInViewport({ ratio: 0.9 });

          // The position of the active item in the list content, which does not
          // change when the list scrolls.
          const getOffset = () => {
            return romania.evaluate((element) => {
              const list = element.closest("[role=listbox]");
              if (!list) return Number.NaN;
              const listTop = list.getBoundingClientRect().top;
              const top = element.getBoundingClientRect().top;
              return top - listTop + list.scrollTop;
            });
          };
          const offset = await getOffset();

          // A real wheel needs the pointer over the list, where some engines
          // then make the item under the pointer the active item, and the
          // desktop projects have no touch input. The page dispatches the
          // gesture event and scrolls by the same distance, so the test covers
          // only the scroll. The distance keeps the active item in view, and it
          // brings in items that the renderer has not measured yet.
          const scrollTop = await listbox.evaluate((element, type) => {
            element.dispatchEvent(new Event(type, { bubbles: true }));
            element.scrollBy({ top: -60 });
            return element.scrollTop;
          }, gesture);
          // The renderer measures the items that enter above the active item,
          // which moves the active item down, past the bottom edge.
          await test.expect.poll(getOffset).not.toBe(offset);

          // The scroll position must not follow the active item.
          test
            .expect(await listbox.evaluate((element) => element.scrollTop))
            .toBe(scrollTop);
        });
      }

      // https://github.com/ariakit/ariakit/issues/7628
      test("does not scroll to a partly visible active item when the renderer measures other items", async ({
        page,
        q,
      }) => {
        const listbox = q.listbox("Country");
        const uganda = q.option("Uganda");

        await q.combobox("Country").click();
        await test.expect(listbox).not.toHaveAttribute("data-placing");
        await page.keyboard.press("u");
        await test.expect(uganda).toHaveAttribute("data-active-item");
        // See the downward test above for these frames.
        await flushFrames(page);
        await test.expect(uganda).toBeInViewport({ ratio: 0.9 });

        // A scroll without a wheel or touch event, as a scrollbar drag makes,
        // does not release the active item. The distance leaves part of the
        // active item in view at the top edge, and it brings in items after it
        // that the renderer has not measured yet.
        const scroll = await listbox.evaluate((element) => {
          element.scrollBy({ top: 160 });
          return { top: element.scrollTop, height: element.scrollHeight };
        });
        // The measured sizes of those items change the size of the list
        // content, but they do not move the active item.
        await test.expect
          .poll(() => listbox.evaluate((element) => element.scrollHeight))
          .not.toBe(scroll.height);

        // Without a move, the active item stays partly out of view.
        test
          .expect(await listbox.evaluate((element) => element.scrollTop))
          .toBe(scroll.top);
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("keeps a far typeahead move in view in a grouped list when items have different sizes", async ({
        page,
        q,
      }) => {
        const uganda = q.option("Uganda");

        await q.combobox("Grouped country").click();
        await test
          .expect(q.listbox("Grouped country"))
          .not.toHaveAttribute("data-placing");

        // Uganda is the third item of its group, so the measured sizes move it
        // twice: its group moves in the list, and it moves in its group.
        await page.keyboard.press("u");
        await test.expect(uganda).toHaveAttribute("data-active-item");
        // See the downward test above for these frames.
        await flushFrames(page);

        await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("keeps a far typeahead move in view when the measured sizes make the list shorter", async ({
        page,
        q,
      }) => {
        const peru = q.option("Peru");

        await q.combobox("Tall first country").click();
        await test
          .expect(q.listbox("Tall first country"))
          .not.toHaveAttribute("data-placing");

        // The tall items at the start make the estimate for the other items too
        // large. When the renderer measures the short items around Peru, the
        // list ends before the scroll position, so the browser moves the scroll
        // position back.
        await page.keyboard.press("p");
        await test.expect(peru).toHaveAttribute("data-active-item");
        // See the downward test above for these frames.
        await flushFrames(page);

        await test.expect(peru).toBeInViewport({ ratio: 0.9 });
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("does not clip a far typeahead move when the renderer scrolls back in several steps", async ({
        page,
        q,
      }) => {
        const latvia = q.option("Latvia");

        await q.combobox("Tall first country").click();
        await test
          .expect(q.listbox("Tall first country"))
          .not.toHaveAttribute("data-placing");

        // Safari adds up the fractions of scroll distances only when it renders
        // no frame between the scrolls, as on a page that is idle when the user
        // presses the key. No state shows that the frames of the open ended.
        // 100 ms is six frames at 60 Hz.
        await page.waitForTimeout(100);
        await page.keyboard.press("l");
        await test.expect(latvia).toHaveAttribute("data-active-item");
        // See the downward test above for these frames.
        await flushFrames(page);

        // The added fractions clip 2 px or more of the 24 px of the item, so
        // this ratio allows for less clipping than the ratio of the other
        // tests.
        await test.expect(latvia).toBeInViewport({ ratio: 0.95 });
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("does not scroll the page when a list that fits in its popup opens", async ({
        page,
        q,
      }) => {
        const select = q.combobox("Short country");

        // Typeahead on the closed select selects the fourth item.
        await select.focus();
        await page.keyboard.press("b");
        await test.expect(select).toHaveText("Belgium");

        // The popup of this list does not scroll, so the page is the scroll
        // element of the list. The page is away from its start, as it is after
        // the user scrolled it.
        const scrollY = await page.evaluate(() => {
          window.scrollTo(0, 30);
          return window.scrollY;
        });
        test.expect(scrollY).toBe(30);

        await select.click();
        await test
          .expect(q.listbox("Short country"))
          .not.toHaveAttribute("data-placing");
        await test
          .expect(q.option("Belgium"))
          .toHaveAttribute("data-active-item");
        // The popup moves to its place, and the renderer measures the items, on
        // the frames after the popup opens. The selected item stays in view, so
        // neither is a reason to scroll, and a check before those frames could
        // pass too early.
        await flushFrames(page);

        await test.expect(select).toBeInViewport();
        test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
      });

      // https://github.com/ariakit/ariakit/issues/7628
      test("does not scroll the page when the measured items no longer fit in the popup", async ({
        page,
        q,
      }) => {
        const select = q.combobox("Crowded country");
        const belgium = q.option("Belgium");

        // Typeahead on the closed select selects the last item.
        await select.focus();
        await page.keyboard.press("b");
        await test.expect(select).toHaveText("Belgium");

        // The window ends 8px below the popup, which is 4px below the select
        // and 200px high. The last item is in the window at its estimated
        // offset. At its measured offset, it would be below the window if the
        // popup did not clip it.
        const selectBottom = await select.evaluate((element) => {
          return element.getBoundingClientRect().bottom;
        });
        const width = page.viewportSize()?.width ?? 1280;
        const height = Math.ceil(selectBottom) + 212;
        await page.setViewportSize({ width, height });
        const scrollY = await page.evaluate(() => window.scrollY);

        await select.click();
        await test
          .expect(q.listbox("Crowded country"))
          .not.toHaveAttribute("data-placing");
        await test.expect(belgium).toHaveAttribute("data-active-item");
        // The renderer measures the items on the frames after the popup opens.
        // The popup then scrolls and clips the selected item, so the offset of
        // the item in the page is not a reason to scroll the page, and a check
        // before those frames could pass too early.
        await flushFrames(page);

        await test.expect(belgium).toBeInViewport({ ratio: 0.9 });
        test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
      });

      // Whether the offsets settle depends on the exact sizes that the renderer
      // measured on the way to the item, so the list opens at several items.
      for (const country of ["Nepal", "Peru", "Zambia"]) {
        // https://github.com/ariakit/ariakit/issues/7792
        test(`stops updating after it measures items with fractional sizes on the way to ${country}`, async ({
          page,
          q,
        }) => {
          const select = q.combobox("Fractional country");
          const listbox = q.listbox("Fractional country");
          const option = q.option(country);
          const renders = q.status("Fractional country item renders");

          // See the first-open test above for the typeahead on the closed
          // select.
          await select.focus();
          await page.keyboard.press(country.charAt(0).toLowerCase());
          await test.expect(select).toHaveText(country);

          await select.click();
          await test.expect(listbox).not.toHaveAttribute("data-placing");
          await test.expect(option).toHaveAttribute("data-active-item");
          // The renderer measures the items on the frames after the popup
          // opens, and the measured sizes move the list to the item. The check
          // below must start after those frames, when the list has no more
          // reason to update.
          await flushFrames(page);
          await test.expect(option).toBeInViewport({ ratio: 0.9 });

          // The page shows no change while the renderer updates without end, so
          // the list shows how many times its items rendered.
          const countRenders = async () => {
            const before = Number(await renders.textContent());
            // A renderer that does not stop renders its items again every few
            // milliseconds, so 200 ms without a render shows that it stopped.
            await page.waitForTimeout(200);
            return Number(await renders.textContent()) - before;
          };
          await test.expect.poll(countRenders).toBe(0);
        });
      }

      // ComboboxRenderer centers the selected item when the popup opens, so the
      // list does not stay at its start there.
      if (renderer === "SelectRenderer") {
        // https://github.com/ariakit/ariakit/issues/7628
        test("opens at the start of a grouped list when a near item is selected", async ({
          page,
          q,
        }) => {
          const select = q.combobox("Grouped country");

          // Typeahead on the closed select selects the first item of the second
          // group.
          await select.focus();
          await page.keyboard.type("br");
          await test.expect(select).toHaveText("Brazil");

          await select.click();
          await test
            .expect(q.listbox("Grouped country"))
            .not.toHaveAttribute("data-placing");
          await test
            .expect(q.option("Brazil"))
            .toHaveAttribute("data-active-item");
          // The group of the item renders at the start of the list until the
          // list gives it its first offset on the frames after the popup opens.
          // The item is in its place in the group by then, but that first
          // layout of the group is not a move, and a check before those frames
          // could pass too early.
          await flushFrames(page);

          await test
            .expect(q.option("Argentina"))
            .toBeInViewport({ ratio: 0.9 });
        });
      }

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

  // https://github.com/ariakit/ariakit/issues/7628
  test("does not scroll when items load into a scrolled container", async ({
    q,
  }) => {
    const scroller = q.region("Late countries");

    // A wheel scroll would release the active item, so the test sets the scroll
    // position, as the browser does when it restores a page.
    const scrollTop = await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop;
    });
    test.expect(scrollTop).toBeGreaterThan(0);

    await q.button("Load late countries").click();
    // Thailand is the active item and the first item of its group, so the list
    // renders it and its group with the first items. The group renders at the
    // start of the list, where the item is fully in view, until the list gives
    // the group its first offset.
    await test
      .expect(q.group("Countries 41 to 44"))
      .not.toHaveCSS("top", "0px");

    // That first layout is not a move, so the text above the list stays in
    // view. A scroll adjustment would run in the same update as the layout.
    await test
      .expect(q.text("The countries load below this text."))
      .toBeInViewport();
    test
      .expect(await scroller.evaluate((element) => element.scrollTop))
      .toBe(scrollTop);
  });

  // https://github.com/ariakit/ariakit/issues/7628
  test("does not scroll the page when a list outside the window measures items", async ({
    page,
    q,
  }) => {
    const scroller = q.region("Late countries");
    const thailand = q.option("Thailand");

    await q.button("Load late countries").click();
    await test.expect(thailand).toHaveAttribute("data-active-item");
    // The active item is in its place when its group has its first offset.
    await test
      .expect(q.group("Countries 41 to 44"))
      .not.toHaveCSS("top", "0px");

    // The page and the list get scroll positions without a wheel or touch
    // event, as when the browser restores a page. The list is then above the
    // window.
    const scrollY = await scroller.evaluate((element) => {
      const { bottom } = element.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + bottom + 100);
      return window.scrollY;
    });
    await test.expect(scroller).not.toBeInViewport();
    // The active item is then at the start of the view of the list.
    await thailand.evaluate((element) => {
      const list = element.closest("[role=region]");
      if (!list) return;
      const listTop = list.getBoundingClientRect().top;
      list.scrollTop += element.getBoundingClientRect().top - listTop;
    });

    // The list renders the items after the active item on the frame after its
    // scroll.
    await test.expect(q.option("Turkey")).toBeAttached();
    // The list measures those items on the frames after that. The measured
    // sizes are a reason to scroll the list only, and a check before those
    // frames could pass too early.
    await flushFrames(page);

    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  });

  // https://github.com/ariakit/ariakit/pull/7765#discussion_r4213071464
  test("keeps a far keyboard move in view in a grid that measures rows and columns", async ({
    page,
    q,
  }) => {
    const first = q.gridcell("1, 1");
    const last = q.gridcell("48, 48");

    await first.click();
    await test.expect(first).toBeFocused();

    // The rows and the cells of the last row have different renderers. Both
    // measure items after the move: the rows move the last cell down, and the
    // cells move it to the right.
    await page.keyboard.press("Control+End");
    await test.expect(last).toBeFocused();
    // See the downward test above for these frames.
    await flushFrames(page);

    await test.expect(last).toBeInViewport({ ratio: 0.9 });
  });

  // https://github.com/ariakit/ariakit/pull/7765#discussion_r4213071464
  test("keeps a far keyboard move in view when each row is the scroll element of its cells", async ({
    page,
    q,
  }) => {
    const first = q.gridcell("S 1, 1");
    const last = q.gridcell("S 48, 48");

    await first.click();
    await test.expect(first).toBeFocused();

    // The rows and the cells of the last row have renderers with different
    // scroll elements. The rows have the size that their renderer estimates, so
    // only the cells move the last cell when the renderers measure.
    await page.keyboard.press("Control+End");
    await test.expect(last).toBeFocused();
    // See the downward test above for these frames.
    await flushFrames(page);

    await test.expect(last).toBeInViewport({ ratio: 0.9 });
  });

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
