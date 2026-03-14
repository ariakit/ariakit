import path from "node:path";
import { invariant } from "@ariakit/core/utils/misc";
import { query } from "@ariakit/test/playwright";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { vizzlyScreenshot } from "@vizzly-testing/cli/client";
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

type CSSProperties = Record<string, string | number>;
type Viewports = Record<string, ViewportSize>;
type Styles = Record<string, CSSProperties>;

interface ScreenshotOptions {
  /**
   * Viewports to capture.
   */
  viewports?: Viewports;
  /**
   * Styles to capture.
   */
  styles?: Styles;
  /**
   * Element or selector to capture. If not provided, all the children of the
   * body element will be captured.
   */
  element?: Locator | string;
  /**
   * Optional CSS properties to apply to <html> for all variants.
   */
  style?: CSSProperties;
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

export const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
} satisfies Viewports;

export const defaultStyles = {
  light: { "--color-canvas": "oklch(99.33% 0.0011 197.14)" },
  dark: { "--color-canvas": "oklch(16.34% 0.0091 264.28)" },
} satisfies Styles;

function getSnapshotTitlePart(part: string) {
  return part.replace(/@\S+/g, "").trim();
}

function getTestFileDir(testInfo: TestInfo) {
  const testDir =
    testInfo.project.testDir || path.join(testInfo.config.rootDir, "src");
  return path.dirname(path.relative(testDir, testInfo.file));
}

function getSnapshotCount(testInfo: TestInfo, baseName: string) {
  const countKey = `${testInfo.file}:${testInfo.project.name}:${baseName}`;
  const count = countMap.get(countKey) || 0;
  countMap.set(countKey, count + 1);
  return count;
}

function getFileSnapshotName(params: {
  id?: string;
  testInfo: TestInfo;
  variants?: string[];
}) {
  const { testInfo, variants = [], id } = params;
  const titleParts = testInfo.titlePath
    .map(getSnapshotTitlePart)
    .filter(Boolean);
  const filteredTitleParts = titleParts
    .filter((part) => !part.endsWith(".ts"))
    .filter((part) => part !== "visual")
    .slice(-2);
  const idParts = id
    ? id
        .split("/")
        .filter(Boolean)
        .filter((part) => part !== "previews")
    : [];
  const parts =
    idParts.length > 0 &&
    filteredTitleParts.length === 1 &&
    filteredTitleParts[0] === "previews"
      ? [...idParts, ...variants]
      : [...filteredTitleParts, ...idParts, ...variants];
  const baseName = slugify(parts.join("-"));
  const count = getSnapshotCount(testInfo, baseName);
  const countSuffix = count > 0 ? `-${count}` : "";
  return `${baseName}${countSuffix}-${testInfo.project.name}.png`;
}

function getVizzlySnapshotName(params: {
  testInfo: TestInfo;
  fileSnapshotName: string;
}) {
  const { testInfo, fileSnapshotName } = params;
  const { name, ext } = path.parse(fileSnapshotName);
  const testFileDir = getTestFileDir(testInfo)
    .split(path.sep)
    .filter(Boolean)
    .filter((part) => part !== "__screenshots__");
  return `${slugify([...testFileDir, name].join("-"))}${ext}`;
}

function shouldUseVizzly() {
  return process.env.USE_VIZZLY === "true";
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
      // Ignore visually hidden elements.
      if (rect.width <= 1 && rect.height <= 1) {
        const style = window.getComputedStyle(el);
        if (
          style.clip !== "auto" &&
          (style.position === "absolute" || style.position === "fixed")
        ) {
          return;
        }
      }
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

async function getPlaywrightScreenshotOptions(
  page: Page,
  options: Pick<ScreenshotOptions, "element" | "clipMargin" | "fullPage">,
) {
  const { element, clipMargin, fullPage } = options;
  if (fullPage) {
    return { animations: "disabled" as const, fullPage: true };
  }
  if (!element) {
    const clip = await getBodyClip(page, clipMargin);
    return { animations: "disabled" as const, clip, fullPage: false };
  }
  const locator = typeof element === "string" ? page.locator(element) : element;
  const rect = await locator.boundingBox();
  invariant(rect, "Element not visible");
  const clip = applyClipMargin(rect, clipMargin);
  return { animations: "disabled" as const, clip, fullPage: false };
}

async function withStyles(
  page: Page,
  styles?: CSSProperties,
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

export async function visual(
  page: Page,
  options: ScreenshotOptions = {},
  testInfo = test.info(),
) {
  expect(
    testInfo.tags,
    "When running visual tests, the test title should contain @visual",
  ).toContain("@visual");

  if (!process.env.VISUAL_TEST) {
    return;
  }

  await page.emulateMedia({ reducedMotion: "reduce" });

  const {
    id,
    viewports = { default: page.viewportSize()! },
    styles = defaultStyles,
    style: defaultStyle = {},
    element,
    clipMargin = DEFAULT_CLIP_MARGIN,
    fullPage = false,
  } = options;

  const viewportEntries = Object.entries(viewports);
  const stylesEntries = Object.entries(styles);

  if (!stylesEntries.length) {
    stylesEntries.push(["default", defaultStyle]);
  }

  for (const [viewportName, viewport] of viewportEntries) {
    await withViewport(page, viewport, async () => {
      for (const [styleName, style] of stylesEntries) {
        await withStyles(page, { ...style, ...defaultStyle }, async () => {
          const variants = [viewportName, styleName];
          const fileSnapshotName = getFileSnapshotName({
            id,
            testInfo,
            variants,
          });
          await page.waitForLoadState("domcontentloaded");
          await page.evaluate(() => document.fonts?.ready?.catch(() => {}));
          const screenshotOptions = await getPlaywrightScreenshotOptions(page, {
            element,
            clipMargin,
            fullPage,
          });
          if (shouldUseVizzly()) {
            const buffer = await page.screenshot(screenshotOptions);
            const vizzlySnapshotName = getVizzlySnapshotName({
              testInfo,
              fileSnapshotName,
            });
            await vizzlyScreenshot(vizzlySnapshotName, buffer, {
              properties: {
                id,
                style: styleName,
                browser: testInfo.project.name,
              },
            });
            return;
          }
          await expect(page).toHaveScreenshot(fileSnapshotName, {
            ...screenshotOptions,
          });
        });
      }
    });
  }
}

export const visualTest = test.extend<{
  visual: (options?: ScreenshotOptions) => Promise<void>;
  q: ReturnType<typeof query>;
}>({
  visual: async ({ page }, use, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await use((options) => visual(page, options, testInfo));
  },
  q: async ({ page }, use) => {
    await use(query(page));
  },
});
