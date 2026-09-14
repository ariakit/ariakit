import { query } from "@ariakit/test/playwright";
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { gotoAndSettle, withFramework } from "./preview.ts";
import type { ScreenshotOptions } from "./visual.ts";
import { viewports } from "./visual.ts";

// Helpers for the tests of the ariakit-ui-* sandboxes, which render the
// examples of one Ariakit UI component in a grid of boxes built with
// app/src/components/ariakit-ui-example.react.tsx.

type WithFrameworkCallback = Parameters<typeof withFramework>[1];
type Visual = (options: ScreenshotOptions) => Promise<void>;

// The color schemes that every Ariakit UI capture is taken in.
const colorSchemes = ["light", "dark"] as const;

export type ColorScheme = (typeof colorSchemes)[number];

// Safari on the macOS runners can take several seconds for one capture of a
// tall sandbox, and a new baseline needs two identical captures in a row, which
// the default five seconds do not cover.
const SCREENSHOT_TIMEOUT = 30_000;

// Keep compact grids in one image and split taller grids at row boundaries.
const SINGLE_CAPTURE_HEIGHT = 1280;
const ROWS_PER_CAPTURE = 3;

// WebP stores each side in 14 bits and every engine fails to encode a taller
// capture. toHaveScreenshot captures at CSS scale, so the unit is CSS pixels.
const MAX_SCREENSHOT_HEIGHT = 16_383;

/**
 * Room around an overlay that renders in a portal, so its capture takes in the
 * anchor beside it: the 8px gutter and a field or a button up to 48px tall.
 */
export const OVERLAY_CLIP_MARGIN = 64;

/**
 * Runs the visual tests of a sandbox. Each test runs at the desktop size of its
 * captures and can take a capture in each color scheme.
 */
export function withCaptures(dirname: string, callback: WithFrameworkCallback) {
  withFramework(dirname, async (params) => {
    params.test.use({ viewport: viewports.desktop });
    // A test loads the sandbox once per color scheme and takes up to two
    // captures in each, every one within the screenshot budget.
    params.test.describe.configure({ timeout: 120_000 });
    return callback(params);
  });
}

/**
 * Runs `capture` in each color scheme. The sandbox follows the system color
 * scheme, and components such as `PopoverArrow` read computed colors when they
 * mount, so the sandbox loads again in each scheme, and `capture` sets up the
 * state it captures from the start.
 */
export async function forEachColorScheme(
  page: Page,
  capture: (colorScheme: ColorScheme) => Promise<void>,
) {
  const url = page.url();
  for (const colorScheme of colorSchemes) {
    // A pointer left over an element from the previous scheme does not move
    // when the capture hovers that element again, and a tooltip waits for a
    // pointer move. The left edge of the viewport is in the padding of the grid
    // at every scroll position.
    await page.mouse.move(0, 0);
    await page.emulateMedia({ colorScheme });
    // A new navigation rather than a reload, which would restore the scroll
    // position of the previous scheme after the capture started scrolling.
    await gotoAndSettle(page, url);
    await page.waitForFunction(isPreviewHydrated);
    await capture(colorScheme);
  }
}

/** The options that capture one element in a color scheme. */
export function getCapture(
  element: Locator,
  colorScheme: ColorScheme,
  options: ScreenshotOptions = {},
) {
  return {
    element,
    viewports: { desktop: viewports.desktop },
    styles: { [colorScheme]: {} },
    timeout: SCREENSHOT_TIMEOUT,
    ...options,
  } satisfies ScreenshotOptions;
}

/**
 * The options that capture the viewport, for a modal dialog whose backdrop
 * covers the whole page. The root element spans the whole document, and a
 * capture that is not full-page trims its clip to the viewport.
 */
export function getViewportCapture(page: Page, colorScheme: ColorScheme) {
  return getCapture(page.locator("html"), colorScheme, { clipMargin: 0 });
}

/** Captures a compact grid whole, or a tall grid in groups of three rows. */
export async function capturePage(
  page: Page,
  visual: Visual,
  colorScheme: ColorScheme,
) {
  const main = query(page).main();
  await page.evaluate(() => document.fonts.ready);
  const { height } = await main.evaluate((node) =>
    node.getBoundingClientRect(),
  );
  if (height <= SINGLE_CAPTURE_HEIGHT) {
    // The grid pads itself, so a margin would only add canvas.
    await visual(
      getCapture(main, colorScheme, { fullPage: true, clipMargin: 0 }),
    );
    return;
  }

  const boxes = main.locator(":scope > article");
  const rows = await boxes.evaluateAll((elements) => {
    const rows: number[][] = [];
    let previousTop: number | undefined;
    for (const [index, element] of elements.entries()) {
      const { top } = element.getBoundingClientRect();
      if (top !== previousTop) {
        rows.push([]);
        previousTop = top;
      }
      rows.at(-1)?.push(index + 1);
    }
    return rows;
  });
  expect(rows.length).toBeGreaterThan(0);
  // Each extra image needs its own screenshot assertion budget in this scheme.
  const extraCaptures = Math.ceil(rows.length / ROWS_PER_CAPTURE) - 1;
  test.setTimeout(test.info().timeout + extraCaptures * SCREENSHOT_TIMEOUT);
  for (let index = 0; index < rows.length; index += ROWS_PER_CAPTURE) {
    const group = rows.slice(index, index + ROWS_PER_CAPTURE).flat();
    const sections = main.locator(
      group.map((child) => `:scope > article:nth-child(${child})`).join(","),
    );
    const bounds = await sections.evaluateAll((elements) => {
      const rects = elements.map((element) => element.getBoundingClientRect());
      return (
        Math.max(...rects.map((rect) => rect.bottom)) -
        Math.min(...rects.map((rect) => rect.top))
      );
    });
    // Half the 16px grid gap keeps adjacent rows outside the capture.
    const clipMargin = 8;
    expect(bounds + clipMargin * 2).toBeLessThanOrEqual(MAX_SCREENSHOT_HEIGHT);
    await visual(
      getCapture(sections, colorScheme, {
        id: `rows-${index + 1}-${Math.min(index + ROWS_PER_CAPTURE, rows.length)}`,
        fullPage: true,
        clipMargin,
      }),
    );
  }
}

/**
 * Captures a box centered in the viewport. A capture that is not full-page
 * clips to the viewport, and a click or a focus scrolls only as far as the
 * element it reaches. Not for a hover state: the scroll would move the box away
 * from the pointer.
 */
export async function captureInView(
  visual: Visual,
  box: Locator,
  colorScheme: ColorScheme,
  options?: ScreenshotOptions,
) {
  await box.evaluate((node) => {
    node.scrollIntoView({ block: "center" });
  });
  await visual(getCapture(box, colorScheme, options));
}

/**
 * Moves the pointer onto an element and waits until the engine matches `:hover`
 * on it, so the capture shows the hover state in every engine. Scrolling first
 * keeps the pointer move from scrolling, which WebKit would not follow with
 * `:hover`, and which resets Ariakit's hover intent.
 */
export async function hoverOver(
  element: Locator,
  position?: { x: number; y: number },
) {
  await element.scrollIntoViewIfNeeded();
  await element.hover({ position });
  await expect
    .poll(() => element.evaluate((node) => node.matches(":hover")))
    .toBe(true);
}

/** Waits until an element has focus that the engine shows as keyboard focus. */
export async function expectFocusVisible(element: Locator) {
  await expect(element).toBeFocused();
  await expect
    .poll(() => element.evaluate((node) => node.matches(":focus-visible")))
    .toBe(true);
}

/** Waits until the page matches a media query that the test emulates. */
export async function expectMedia(page: Page, mediaQuery: string) {
  await expect
    .poll(() => page.evaluate((media) => matchMedia(media).matches, mediaQuery))
    .toBe(true);
}

/**
 * Moves real keyboard focus to an element. A Tab press, not a programmatic
 * focus, is what makes `:focus-visible` match in every engine, and stepping
 * back and forward returns to the element in each engine's own Tab order.
 */
export async function tabTo(page: Page, element: Locator) {
  await element.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
}

/**
 * Tabs into the example of a box. The box's More info button is the last stop
 * before the example, so a Tab from it moves to the example's first stop.
 */
export async function tabInto(page: Page, box: Locator) {
  await query(box).button("More info").focus();
  await page.keyboard.press("Tab");
}

/**
 * Counts the animations running on an overlay and its content. Ariakit renders
 * the backdrop of a dialog as the element right before it, so a dialog passes
 * `withBackdrop` to count the backdrop too.
 */
export function countAnimations(overlay: Locator, withBackdrop = false) {
  return overlay.evaluate((node, backdrop) => {
    const count = node.getAnimations({ subtree: true }).length;
    if (!backdrop) return count;
    const element = node.previousElementSibling;
    if (!element) return Number.NaN;
    return count + element.getAnimations().length;
  }, withBackdrop);
}
