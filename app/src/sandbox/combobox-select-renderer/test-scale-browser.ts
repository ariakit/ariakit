import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
    test.describe(renderer, () => {
      test.beforeEach(async ({ q }) => {
        if (renderer === "SelectRenderer") {
          await q.button("Use SelectRenderer").click();
        }
      });

      for (const label of ["Scaled country", "Scaled grouped country"]) {
        // https://github.com/ariakit/ariakit/issues/7777
        test(`keeps a far move in view in the ${label} popup`, async ({
          page,
          q,
        }) => {
          const list = q.listbox(label);
          const uganda = query(list).option("Uganda");
          await q.combobox(label).click();
          await test.expect(list).not.toHaveAttribute("data-placing");
          await page.keyboard.press("u");
          await test.expect(uganda).toHaveAttribute("data-active-item");
          // The initial scroll shows an estimated offset. The next frames
          // render and measure the items, which can move the active item.
          await flushFrames(page);
          await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
        });

        // https://github.com/ariakit/ariakit/issues/7777
        test(`does not overlap measured items in the ${label} popup`, async ({
          page,
          q,
        }) => {
          const list = q.listbox(label);
          await q.combobox(label).click();
          await test.expect(list).not.toHaveAttribute("data-placing");
          const argentina = query(list).option("Argentina");
          const australia = query(list).option("Australia");
          await test.expect(argentina).toBeInViewport({ ratio: 0.9 });
          await test.expect(australia).toBeInViewport({ ratio: 0.9 });
          // The estimated offsets can leave gaps before measurement replaces
          // them. Cross that update before checking that rows do not overlap.
          await flushFrames(page);
          await test.expect
            .poll(async () => {
              const first = await argentina.boundingBox();
              const second = await australia.boundingBox();
              if (!first || !second) return Number.NaN;
              return second.y - first.y - first.height;
            })
            .toBeGreaterThanOrEqual(-0.05);
        });
      }

      // https://github.com/ariakit/ariakit/issues/7777
      test("renders the visible window after scrolling a scaled horizontal list", async ({
        page,
        q,
      }) => {
        await page.addStyleTag({
          content: `.clipped-popover {
            max-width: 219.6px;
            transform: scale(0.9);
            transform-origin: top left;
          }`,
        });
        await q.combobox("Clipped fruit").click();
        const list = q.listbox("Clipped fruit");
        await test.expect(list).not.toHaveAttribute("data-placing");
        // Fixed item sizes keep the scroll range stable during this scrollbar
        // move. No keyboard move keeps the destination item mounted.
        await list.evaluate((element) => {
          element.scrollLeft = 3000;
        });
        await test.expect(q.option("Fruit 33")).toBeInViewport({ ratio: 0.9 });
      });

      // https://github.com/ariakit/ariakit/issues/7777
      test("measures content-box items with fractional padding in a scaled popup", async ({
        page,
        q,
      }) => {
        await page.addStyleTag({
          content: `.scaled-country-popover,
            .scaled-country-popover [role="option"] {
              box-sizing: content-box;
              padding-block: 3.5px;
              border-block-width: 1.5px;
            }`,
        });
        await q.combobox("Scaled country").click();
        const list = q.listbox("Scaled country");
        await test.expect(list).not.toHaveAttribute("data-placing");
        // Initial estimated offsets precede the measured border-box sizes.
        await flushFrames(page);
        await test.expect
          .poll(async () => {
            const first = await query(list).option("Argentina").boundingBox();
            const second = await query(list).option("Australia").boundingBox();
            if (!first || !second) return Number.NaN;
            return second.y - first.y - first.height;
          })
          .toBeCloseTo(0, 1);
        await page.keyboard.press("u");
        const uganda = query(list).option("Uganda");
        await test.expect(uganda).toHaveAttribute("data-active-item");
        // The scroll renders a new window before measuring its item sizes.
        await flushFrames(page);
        await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
      });
    });
  }

  test.describe("Scaled grid", () => {
    test.beforeEach(async ({ page }) => {
      await page.addStyleTag({
        content: `.measured-grid-scroller {
          width: 299.6px;
          height: 199.6px;
          transform: scale(0.85, 1.15);
          transform-origin: top left;
        }`,
      });
    });

    // https://github.com/ariakit/ariakit/issues/7777
    test("keeps a far grid move in view with different scales on each axis", async ({
      page,
      q,
    }) => {
      await q.gridcell("1, 1").click();
      await page.keyboard.press("Control+End");
      const last = q.gridcell("48, 48");
      await test.expect(last).toBeFocused();
      // Each axis measures the items rendered after the initial scroll.
      await flushFrames(page);
      await test.expect(last).toBeInViewport({ ratio: 0.9 });
    });

    // https://github.com/ariakit/ariakit/issues/7777
    test("lays out adjacent measured cells without scaled gaps or overlaps", async ({
      page,
      q,
    }) => {
      const first = q.gridcell("1, 1");
      await first.scrollIntoViewIfNeeded();
      await test.expect(first).toBeInViewport({ ratio: 0.9 });
      // Wait for measurement to replace the initial estimates on both axes.
      await flushFrames(page);
      await test.expect
        .poll(async () => {
          const origin = await first.boundingBox();
          const column = await q.gridcell("1, 2").boundingBox();
          const row = await q.gridcell("2, 1").boundingBox();
          if (!origin || !column || !row) return Number.NaN;
          return Math.max(
            Math.abs(column.x - origin.x - origin.width),
            Math.abs(row.y - origin.y - origin.height),
          );
        })
        .toBeLessThan(0.05);
    });
  });
});
