import type { query } from "@ariakit/test/playwright";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

type Query = ReturnType<typeof query>;

/** Switches the sandbox to one of its scenarios through the header select. */
export async function selectScenario(q: Query, scenario: string) {
  await q.combobox("Scenario").selectOption(scenario);
}

/** The shell root on the page: the outermost one when shells are nested. */
export function getShell(page: Page) {
  return page.locator(".shell").first();
}

/** The column of the sidebar whose landmark has the given name. */
export function getSidebar(q: Query, name: string) {
  return q
    .navigation(name, { includeHidden: true })
    .or(q.complementary(name, { includeHidden: true }))
    .locator(
      "xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' shell-sidebar ')][1]",
    );
}

/** The first rendered child of main, which sits in the content column. */
export function getContent(q: Query) {
  return q.main().locator(":scope > :not(style)").first();
}

export async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("The element has no box");
  }
  return box;
}

/** How far the center of `inner` sits from the center of `outer`, in px. */
export async function getCenterOffset(inner: Locator, outer: Locator) {
  const [innerBox, outerBox] = await Promise.all([
    getBox(inner),
    getBox(outer),
  ]);
  const innerCenter = innerBox.x + innerBox.width / 2;
  const outerCenter = outerBox.x + outerBox.width / 2;
  return innerCenter - outerCenter;
}

/** Waits until `inner` is centered on `outer` within a pixel. */
export async function expectCentered(inner: Locator, outer: Locator) {
  await expect
    .poll(() => getCenterOffset(inner, outer), { timeout: 5_000 })
    .toBeCloseTo(0, 0);
}

/**
 * Samples the center offset on every frame for the given time and returns the
 * largest one seen, so a drawer motion can be checked as it runs.
 */
export async function sampleCenterOffset(
  page: Page,
  inner: Locator,
  outer: Locator,
  ms: number,
) {
  const [innerHandle, outerHandle] = await Promise.all([
    inner.elementHandle(),
    outer.elementHandle(),
  ]);
  if (!innerHandle || !outerHandle) {
    throw new Error("The elements have no handles");
  }
  return page.evaluate(
    ([innerEl, outerEl, duration]) =>
      new Promise<number>((resolve) => {
        let largest = 0;
        const start = performance.now();
        const sample = () => {
          const innerBox = innerEl.getBoundingClientRect();
          const outerBox = outerEl.getBoundingClientRect();
          const offset =
            innerBox.x + innerBox.width / 2 - (outerBox.x + outerBox.width / 2);
          largest = Math.max(largest, Math.abs(offset));
          if (performance.now() - start < duration) {
            requestAnimationFrame(sample);
          } else {
            resolve(largest);
          }
        };
        sample();
      }),
    [innerHandle, outerHandle, ms] as const,
  );
}
