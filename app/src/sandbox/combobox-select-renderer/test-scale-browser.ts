import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
    test.describe(renderer, () => {
      test.beforeEach(async ({ page, q }) => {
        if (renderer === "SelectRenderer") {
          await q.button("Use SelectRenderer").click();
        }
        await page.addStyleTag({
          content: `.mixed-size-popover {
            max-height: 199.6px;
            transform: scale(0.9);
            transform-origin: top left;
          }`,
        });
      });

      for (const label of ["Country", "Grouped country"]) {
        // https://github.com/ariakit/ariakit/issues/7777
        test(`keeps a far move in view in the scaled ${label} popup`, async ({
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
        test(`does not overlap measured items in the scaled ${label} popup`, async ({
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
    });
  }
});
