import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface ActiveItemFrame {
  first: string | null;
  active: string | null;
}

declare global {
  interface Window {
    activeItemFrames: ActiveItemFrame[];
  }
}

interface FilterFixture {
  page: Page;
  listbox: Locator;
  activeCountry: Locator;
}

/**
 * Records the first option and the highlighted option on every animation frame,
 * so the test can inspect what each frame was about to paint. The ledger reads
 * the listbox element the locator resolves to, because a page-wide query would
 * also match the sibling combobox's hidden options.
 */
function startFrameLedger(listbox: Locator) {
  return listbox.evaluate((element) => {
    window.activeItemFrames = [];
    const sample = () => {
      const first = element.querySelector<HTMLElement>('[role="option"]');
      const active = element.querySelector<HTMLElement>(
        '[role="option"][data-active-item]',
      );
      window.activeItemFrames.push({
        first: first?.textContent ?? null,
        active: active?.textContent ?? null,
      });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

function readFrameLedger(page: Page) {
  return page.evaluate(() => window.activeItemFrames);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Types "an" and deletes the "n" while recording every animation frame.
  // Typing "an" promotes Andorra above Afghanistan, and Backspace restores the
  // previous order, so both directions move the auto-selected item. The report
  // repeats these two steps, so the loop does too.
  const expectNoStaleFrames = async (fixture: FilterFixture) => {
    const { page, listbox, activeCountry } = fixture;
    const options = query(listbox).option();
    await startFrameLedger(listbox);

    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.type("n");
      await test.expect(options.first()).toHaveText("Andorra");
      await test.expect(activeCountry).toHaveText("Andorra");

      await page.keyboard.press("Backspace");
      await test.expect(options.first()).toHaveText("Afghanistan");
      await test.expect(activeCountry).toHaveText("Afghanistan");
    }

    const frames = await readFrameLedger(page);

    // The loop alternates the first option between these two countries, so
    // seeing both proves the ledger sampled the list on both sides of the
    // filter changes instead of never finding an option.
    test.expect(frames.map((frame) => frame.first)).toContain("Andorra");
    test.expect(frames.map((frame) => frame.first)).toContain("Afghanistan");

    // With `autoSelect`, the first option is always the highlighted one, so any
    // frame that highlights another option, or none, is the reported flicker.
    const staleFrames = frames.filter(
      (frame) => frame.first !== null && frame.active !== frame.first,
    );
    test.expect(staleFrames).toEqual([]);
  };

  // https://github.com/ariakit/ariakit/issues/3914
  //
  // With a controlled `activeId`, the filtered list and the highlighted item
  // used to reach the screen in different frames: the list committed first, and
  // the auto-selected id only followed once the passive registration and
  // auto-select effects had run. The user saw the new first option while the
  // previously active option was still highlighted.
  //
  // A retrying assertion cannot observe this, because it only sees the settled
  // state. The frame ledger samples the DOM on every animation frame, which is
  // the boundary the flicker crosses.
  test("never paints the filtered list with the previously active item", async ({
    page,
    q,
  }) => {
    const listbox = q.listbox("Country");
    const options = query(listbox).option();
    const activeCountry = q.status("Active country");

    await q.combobox("Country").click();
    await page.keyboard.type("a");
    await test.expect(options.first()).toHaveText("Afghanistan");
    await test.expect(activeCountry).toHaveText("Afghanistan");

    await expectNoStaleFrames({ page, listbox, activeCountry });
  });

  // https://github.com/ariakit/ariakit/issues/3914
  //
  // Same contract for the composition in the bug report: a virtualized select
  // with combobox. The virtualizer mounts items from its own layout effect, so
  // it registers items in a different order than the plain list above.
  test("never paints the filtered virtualized list with the previously active item", async ({
    page,
    q,
  }) => {
    const listbox = q.listbox("Virtualized country");
    const options = query(listbox).option();
    const activeCountry = q.status("Active virtualized country");
    const input = q.combobox("Search virtualized countries");

    await q.combobox("Virtualized country").click();
    await test.expect(input).toBeFocused();

    await page.keyboard.type("a");
    await test.expect(options.first()).toHaveText("Afghanistan");
    await test.expect(activeCountry).toHaveText("Afghanistan");

    // The list is virtualized, so it renders more than a couple of items but
    // far fewer than the matches.
    const rendered = await options.count();
    test.expect(rendered).toBeGreaterThan(2);
    test.expect(rendered).toBeLessThan(50);

    await expectNoStaleFrames({ page, listbox, activeCountry });
  });
});
