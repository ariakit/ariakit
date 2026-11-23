import { withFramework } from "#app/test-utils/preview.ts";
import { getGrowthGap } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("brings a new note into view at the end of a full row", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 5; count++) {
      await newNote.click();
    }
    const tab = q.tab("Note 5");
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    // The strip clips the tabs that are out of its view.
    await test.expect(tab).toBeInViewport({ ratio: 1 });
  });

  test("keeps the selected note whole in view while the row gets narrower", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 5; count++) {
      await newNote.click();
    }
    const tab = q.tab("Note 5");
    await test.expect(tab).toBeInViewport({ ratio: 1 });
    // The note shows whole while it grows in too, and the strip then scrolls to
    // the grown note on its own.
    await test.expect
      .poll(() => getGrowthGap(tab, q.tab("Note 4")))
      .toBeLessThan(0.5);
    // The tabs are as wide as the window at most, so a narrower window makes
    // the strip narrower in steps, like a sidebar that opens beside it.
    for (const width of [480, 440, 400, 360]) {
      await page.setViewportSize({ width, height: 500 });
      await test.expect
        .poll(() =>
          q
            .tablist("Open notes")
            .evaluate((strip) => strip.getBoundingClientRect().right),
        )
        .toBeLessThanOrEqual(width);
      await test.expect(tab).toBeInViewport({ ratio: 1 });
    }
  });

  test("moves a note to the place where the pointer drops it", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Workshop");
    const next = q.tab("Trip");
    await test.expect(tab).toHaveAttribute("aria-selected", "false");
    const [from, to] = await Promise.all([
      tab.boundingBox(),
      next.boundingBox(),
    ]);
    if (!from || !to) throw new Error("A tab has no bounding box.");
    const y = from.y + from.height / 2;
    await page.mouse.move(from.x + from.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, y, { steps: 8 });
    // The other note makes room before the drop.
    await test.expect
      .poll(async () => (await next.boundingBox())?.x)
      .toBeCloseTo(from.x, 0);
    await page.mouse.up();
    await test.expect
      .poll(() => q.tab().allTextContents())
      .toEqual(["Groceries", "Trip", "Workshop"]);
    // The drag selects the note.
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Workshop")).toBeVisible();
  });
});
