import type { Page } from "@playwright/test";

declare global {
  interface Window {
    // Only exists once `recordPageScrolls` has run.
    __pageScrolls?: number[];
  }
}

/**
 * Starts recording scrolls of the page itself, ignoring scrolls of any element
 * inside it. Each entry is the time a scroll was observed, so a failure says
 * how many there were and when. The offset isn't recorded because a scroll
 * event is dispatched after the task that scrolled, by which point the code
 * under test has already restored the page.
 */
export async function recordPageScrolls(page: Page) {
  await page.evaluate(() => {
    window.__pageScrolls = [];
    document.addEventListener(
      "scroll",
      (event) => {
        const scroller = document.scrollingElement;
        if (event.target !== document && event.target !== scroller) return;
        window.__pageScrolls?.push(Math.round(performance.now()));
      },
      true,
    );
  });
}

/**
 * Returns the times of the scrolls recorded since `recordPageScrolls`.
 */
export function getPageScrolls(page: Page) {
  return page.evaluate(() => window.__pageScrolls ?? []);
}
