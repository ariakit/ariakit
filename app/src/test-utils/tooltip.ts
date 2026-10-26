import type { Locator, Page } from "@playwright/test";
import { flushFrames } from "./preview.ts";

// Helpers for tests of Ariakit UI tooltips in recipes, sandboxes, and app
// pages.

/** How long Ariakit waits before the first tooltip shows on hover. */
export const SHOW_TIMEOUT = 500;

/**
 * How long Ariakit keeps a tooltip as the active one after its popup closes, so
 * the next tooltip shows without its delay.
 */
export const SKIP_TIMEOUT = 300;

interface TooltipOpening {
  delay: number;
  animations: number;
}

/**
 * Watches an anchor until the tooltip that starts with the given text opens
 * after the pointer enters the anchor. Returns a function that resolves to the
 * delay from the pointer entering to the tooltip opening, timed in the page, so
 * the time that Playwright takes to send the move doesn't count. It also
 * resolves to the number of animations that run when the tooltip opens.
 */
export async function watchOpening(anchor: Locator, text: string) {
  const handle = await anchor.evaluateHandle((element, text) => {
    const promise = new Promise<TooltipOpening>((resolve) => {
      let start: number | undefined;
      let delay: number | undefined;
      element.addEventListener(
        "mouseenter",
        () => {
          start = performance.now();
        },
        { once: true },
      );
      const observer = new MutationObserver(() => {
        if (start == null) return;
        const tooltip = [
          ...element.ownerDocument.querySelectorAll("[role=tooltip]"),
        ].find((node) => node.textContent?.startsWith(text));
        if (!tooltip) return;
        if (delay == null && tooltip.hasAttribute("data-open")) {
          delay = performance.now() - start;
        }
        if (delay == null) return;
        // The enter animation starts when Ariakit adds data-enter.
        if (!tooltip.hasAttribute("data-enter")) return;
        observer.disconnect();
        const openingDelay = delay;
        requestAnimationFrame(() => {
          resolve({
            delay: openingDelay,
            animations: tooltip.getAnimations().length,
          });
        });
      });
      observer.observe(element.ownerDocument.body, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    });
    // An object keeps evaluateHandle from waiting for the promise.
    return { promise };
  }, text);
  return () => handle.evaluate(({ promise }) => promise);
}

/**
 * Hovers an anchor and waits until a tooltip would have shown after the show
 * timeout, so a test can assert that none shows.
 */
export async function hoverPastShowTimeout(page: Page, anchor: Locator) {
  // Ariakit resets hover intent on scroll, so the anchor must be in view before
  // the pointer moves over it.
  await anchor.scrollIntoViewIfNeeded();
  await anchor.hover();
  // No state tracks a tooltip that doesn't show. Cross Ariakit's show timeout,
  // then the frames that would render the tooltip.
  await page.waitForTimeout(SHOW_TIMEOUT);
  await flushFrames(page);
}
