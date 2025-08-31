import { invariant } from "@ariakit/core/utils/misc";
import {
  expect,
  type Locator,
  type Page,
  type TestInfo,
  test,
} from "@playwright/test";
import { slugify } from "#app/lib/string.ts";

const DEFAULT_CLIP_MARGIN = 16;

const countMap = new Map<string, number>();

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

type Styles = Record<string, string | number>;

interface SizeVariant {
  viewport?: ViewportSize;
}

interface StyleVariant {
  styles?: Styles;
}

type Variants = Record<string, SizeVariant | StyleVariant>;

interface ScreenshotOptions {
  /**
   * Variants to capture.
   */
  variants?: Variants;
  /**
   * Element or selector to capture. If not provided, all the children of the
   * body element will be captured.
   */
  element?: Locator | string;
  /**
   * Optional CSS properties to apply to <html> for all variants.
   */
  styles?: Styles;
  /**
   * Additional identifier to disambiguate snapshots (e.g., path slug).
   */
  id?: string;
  /**
   * Margin (px) around cropped content.
   * @default 16
   */
  clipMargin?: number;
  /**
   * Whether to capture the full page.
   * @default false
   */
  fullPage?: boolean;
}

export const variants = {
  desktop: { viewport: { width: 1280, height: 800 } },
  mobile: { viewport: { width: 390, height: 844 } },
  light: { styles: { "--color-canvas": "oklch(99.33% 0.0011 197.14)" } },
  dark: { styles: { "--color-canvas": "oklch(16.34% 0.0091 264.28)" } },
} satisfies Variants;

export const defaultVariants = {
  desktop: variants.desktop,
  mobile: variants.mobile,
  light: variants.light,
  dark: variants.dark,
};

function getSnapshotName(params: {
  id?: string;
  testInfo: TestInfo;
  variants?: string[];
}) {
  const { testInfo, variants = [], id } = params;
  const parts = [
    ...testInfo.titlePath,
    id,
    ...variants,
    testInfo.project.name,
  ].filter(Boolean);
  const baseName = slugify(parts.join("-"));
  const count = countMap.get(baseName) || 0;
  countMap.set(baseName, count + 1);
  return `${baseName}-${count}.png`;
}

function getCombinedClip(a: Rect, b: Rect) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

function applyClipMargin(rect: Rect, margin = DEFAULT_CLIP_MARGIN) {
  return {
    x: rect.x - margin,
    y: rect.y - margin,
    width: rect.width + margin * 2,
    height: rect.height + margin * 2,
  };
}

function getRectsClip(rects: Rect[], margin = DEFAULT_CLIP_MARGIN) {
  const [first, ...rest] = rects;
  if (!first) {
    throw new Error("No elements to capture");
  }
  let combinedRect = first;
  for (const rect of rest) {
    combinedRect = getCombinedClip(combinedRect, rect);
  }
  const x = Math.max(0, Math.floor(combinedRect.x));
  const y = Math.max(0, Math.floor(combinedRect.y));
  const width = Math.ceil(combinedRect.width);
  const height = Math.ceil(combinedRect.height);
  return applyClipMargin({ x, y, width, height }, margin);
}

async function getBodyClip(page: Page, margin = DEFAULT_CLIP_MARGIN) {
  const rects = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const rects: Rect[] = [];
    const walk = (el: Element, padded = true) => {
      const rect = el.getBoundingClientRect();
      const isSized = rect.width > 0 && rect.height > 0;
      if (isSized && (!padded || Math.round(rect.width) < viewportWidth)) {
        rects.push(rect);
        // stop descending this branch once a non-full-width element is found
        return;
      }
      for (const child of el.children) {
        walk(child);
      }
    };
    for (const child of document.body.children) {
      walk(child);
    }
    // If no elements were found, walk the body without padding.
    if (rects.length === 0) {
      for (const child of document.body.children) {
        walk(child, false);
      }
    }
    return rects;
  });
  return getRectsClip(rects, margin);
}

async function captureScreenshotBuffer(
  page: Page,
  options: Pick<ScreenshotOptions, "element" | "clipMargin" | "fullPage">,
) {
  const { element, clipMargin, fullPage } = options;
  if (fullPage) {
    return page.screenshot({ animations: "disabled" });
  }
  if (!element) {
    const clip = await getBodyClip(page, clipMargin);
    return page.screenshot({ animations: "disabled", clip });
  }
  const locator = typeof element === "string" ? page.locator(element) : element;
  const rect = await locator.boundingBox();
  invariant(rect, "Element not visible");
  const clip = applyClipMargin(rect, clipMargin);
  return page.screenshot({ animations: "disabled", clip });
}

async function withStyles(
  page: Page,
  styles?: Styles,
  fn?: () => Promise<void>,
) {
  if (!styles) {
    await fn?.();
    return;
  }
  const originalStyles = await page.evaluate((styles) => {
    const el = document.documentElement;
    const originalStyles = el.getAttribute("style");
    for (const [k, v] of Object.entries(styles)) {
      el.style.setProperty(k, String(v));
    }
    return originalStyles;
  }, styles);
  try {
    await fn?.();
  } finally {
    await page.evaluate((originalStyles) => {
      const el = document.documentElement;
      if (originalStyles) {
        el.setAttribute("style", originalStyles);
      } else {
        el.removeAttribute("style");
      }
    }, originalStyles);
  }
}

async function withViewport(
  page: Page,
  viewport?: ViewportSize,
  fn?: () => Promise<void>,
) {
  if (!viewport) {
    await fn?.();
    return;
  }
  const original = page.viewportSize();
  await page.setViewportSize(viewport);
  try {
    await fn?.();
  } finally {
    if (original) {
      await page.setViewportSize(original);
    }
  }
}

function splitVariants(variants: Variants) {
  const viewports: Record<string, ViewportSize> = {};
  const styles: Record<string, Styles> = {};
  for (const [k, v] of Object.entries(variants)) {
    if ("viewport" in v && v.viewport) {
      viewports[k] = v.viewport;
    }
    if ("styles" in v && v.styles) {
      styles[k] = v.styles;
    }
  }
  return { viewports, styles };
}

export async function screenshot(page: Page, options: ScreenshotOptions = {}) {
  if (!process.env.VISUAL_TEST) {
    return;
  }
  const {
    id,
    variants = defaultVariants,
    styles: additionalStyles,
    element,
    clipMargin = DEFAULT_CLIP_MARGIN,
    fullPage = false,
  } = options;
  const { viewports, styles } = splitVariants(variants);

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    await withViewport(page, viewport, async () => {
      for (const [styleName, style] of Object.entries(styles)) {
        await withStyles(page, { ...style, ...additionalStyles }, async () => {
          const testInfo = test.info();
          const name = getSnapshotName({
            id,
            testInfo,
            variants: [viewportName, styleName],
          });
          await page.waitForLoadState("domcontentloaded");
          await page.evaluate(() => document.fonts?.ready?.catch(() => {}));

          const buffer = await captureScreenshotBuffer(page, {
            element,
            clipMargin,
            fullPage,
          });

          expect.soft(buffer).toMatchSnapshot(name);
        });
      }
    });
  }
}
