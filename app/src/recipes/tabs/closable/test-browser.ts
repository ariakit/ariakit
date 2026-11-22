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
});
