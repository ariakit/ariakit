import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { flushFrames } from "./preview.ts";

/**
 * Asserts that `item` sits at the vertical center of `scrollport`. Retries,
 * because the presentation that centers an item can land after the state the
 * test waited on.
 */
export async function expectVerticallyCentered(
  scrollport: Locator,
  item: Locator,
) {
  await expect(async () => {
    const scrollportBox = await scrollport.boundingBox();
    const itemBox = await item.boundingBox();
    if (!scrollportBox) throw new Error("The scrollport has no bounding box.");
    if (!itemBox) throw new Error("The item has no bounding box.");
    const scrollportCenter = scrollportBox.y + scrollportBox.height / 2;
    const itemCenter = itemBox.y + itemBox.height / 2;
    expect(itemCenter).toBeCloseTo(scrollportCenter, 0);
  }).toPass();
}

declare global {
  interface Window {
    __scrollEvents?: string[];
  }
}

export interface ScrollRecorder {
  /**
   * Names of the scrollports that fired a `scroll` event since recording
   * started, in order. The document is named `document`; elements are named by
   * their tag name.
   *
   * Waits a frame first, because a scroll that has already happened has not
   * necessarily dispatched its event yet. Reading without that wait makes the
   * recording empty for exactly the case it exists to catch: a scroll and a
   * restore inside one task.
   */
  events: () => Promise<string[]>;
}

/**
 * Starts recording `scroll` events on every scrollport in the page, and returns
 * once the events from anything the test did to set itself up have been
 * dispatched and dropped.
 *
 * Final offsets alone don't prove that nothing moved: code that scrolls and
 * restores within the same task leaves the offsets untouched but still fires a
 * `scroll` event, which the user sees as an overlay scrollbar flash. The
 * complement is true as well, since a no-op scroll write fires no event at all,
 * so a test that asserts an empty recording also has to assert the offsets.
 */
export async function recordScrollEvents(page: Page): Promise<ScrollRecorder> {
  await page.evaluate(() => {
    if (!window.__scrollEvents) {
      const events: string[] = [];
      window.__scrollEvents = events;
      document.addEventListener(
        "scroll",
        (event) => {
          const { target } = event;
          events.push(target instanceof Element ? target.tagName : "document");
        },
        true,
      );
    }
  });
  // A scroll dispatches its event on the next rendering opportunity, so a test
  // that scrolled to set itself up would otherwise see that event attributed to
  // the interaction under test.
  await flushFrames(page);
  await page.evaluate(() => {
    if (window.__scrollEvents) {
      window.__scrollEvents.length = 0;
    }
  });
  return {
    events: async () => {
      await flushFrames(page);
      return page.evaluate(() => window.__scrollEvents ?? []);
    },
  };
}
