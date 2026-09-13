import type { Locator } from "@playwright/test";
import {
  captureInView,
  captureSections,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // The narrow containers of the fixture tables let the cells scroll under the
  // pinned ones. A pinned cell must paint the row's surface, which the row
  // shows through the ordinary cells, at rest and in every row state.
  const scrollCellsUnderPinnedCell = async (table: Locator) => {
    const scroller = table.locator("xpath=..");
    const scrollLeft = await scroller.evaluate((node) => {
      node.scrollLeft = node.scrollWidth;
      return node.scrollLeft;
    });
    test.expect(scrollLeft).toBeGreaterThan(0);
  };

  // The section captures also keep the cell layers and the inherited column
  // styles of the table fixtures under visual regression.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974548937
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
    );
  });

  test("draws a focused cell's ring inside the cell @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Selected rows");
      const grid = query(box);
      await grid.checkbox("Select all rows").focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowRight");
      await expectFocusVisible(grid.rowheader("Glider"));
      await captureInView(visual, box, colorScheme);
    });
  });

  // The last row draws no line below it, and its ring follows the container's
  // rounded bottom corners inside its 1px border.
  test("rounds the ring of the focused last row @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Focusable rows");
      await query(box)
        .row(/^Button /)
        .focus();
      await page.keyboard.press("End");
      await expectFocusVisible(query(box).row(/^Table /));
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("paints the pinned cell over the cells scrolled under it @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table cell layer");
      await scrollCellsUnderPinnedCell(query(box).grid());
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("shows the hovered row through ordinary cells @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table cell layer");
      await scrollCellsUnderPinnedCell(query(box).grid());
      await hoverOver(query(box).text("Disabled surface"));
      await visual(getCapture(box, colorScheme));
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("shows the selected row through ordinary cells @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table cell layer");
      await scrollCellsUnderPinnedCell(query(box).grid());
      await query(box).checkbox("Select row").check();
      await test
        .expect(query(box).row())
        .toHaveAttribute("aria-selected", "true");
      await captureInView(visual, box, colorScheme);
    });
  });

  // The head cell sets the pinned column, and the body and foot cells inherit
  // it, so the names stay over the scrolled columns in every row group.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps the names pinned over the scrolled columns @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table rows");
      await scrollCellsUnderPinnedCell(query(box).table("Team hours"));
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("scrolls the names with the columns when they are unpinned @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table rows");
      const pin = query(box).checkbox("Pin contributor names");
      await pin.uncheck();
      await test.expect(pin).not.toBeChecked();
      await scrollCellsUnderPinnedCell(query(box).table("Team hours"));
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps missing hours under their header after adding a contributor @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table rows");
      await query(box).button("Add contributor").click();
      await test.expect(query(box).row(/^Katherine\b/)).toBeVisible();
      await captureInView(visual, box, colorScheme);
    });
  });
});
