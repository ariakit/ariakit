import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  visual as captureVisual,
  visualBatch as captureVisualBatch,
} from "@visonaut/playwright";
import type { Variant } from "@visonaut/playwright";
import { isFramework } from "#app/lib/framework.ts";
import type { Framework } from "#app/lib/schemas.ts";

const DEFAULT_CLIP_MARGIN = 16;
const CLIP_STABILITY_INTERVAL = 16;
const CLIP_STABILITY_DURATION = 100;
const CLIP_STABILITY_TIMEOUT = 1000;
// A font from the local server loads in milliseconds. The bound turns a load
// that never finishes into a clear failure well within the test budget.
const FONTS_TIMEOUT = 10_000;

// Keep the source within the card dimension bound and Visonaut's pixel limit.
const MAX_BATCH_CAPTURE_DIMENSION = 16_383;
const MAX_BATCH_CAPTURE_PIXELS = 32_000_000;

// Chromium's forced colors can override Playwright's transparent caret. Keep
// that caret steady without changing focus or disabling forced colors.
// https://github.com/microsoft/playwright/issues/15211
const screenshotStyle = "* { caret-animation: manual !important; }";

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

export interface ScreenshotRegion {
  /** Stable suffix appended to the parent capture's item. */
  name: string;
  element: Locator | string;
}

export interface ScreenshotOptions {
  /** Stable identity of the captured UI state across runs. */
  item: string;
  /** Framework variant when the test itself has no framework tag. */
  framework?: Framework;
  /**
   * Viewports to capture.
   */
  viewports?: Viewports;
  /**
   * Styles to capture.
   */
  styles?: Styles;
  /**
   * Elements or selector to capture as one bounding box. If not provided, all
   * the children of the body element will be captured. Combine it with
   * `fullPage` to capture an element that is taller than the viewport.
   */
  element?: Locator | string;
  /** Separate items cropped from one stable full-page capture. */
  regions?: ScreenshotRegion[];
  /**
   * Optional CSS properties to apply to <html> for all variants.
   */
  style?: CSSProperties;
  /**
   * Margin (px) around cropped content.
   * @default 16
   */
  clipMargin?: number;
  /**
   * Whether to capture the full page. With `element`, captures the element's
   * whole box, including the parts below the viewport.
   * @default false
   */
  fullPage?: boolean;
  /** Capture deadline in milliseconds, including two stable screenshots. */
  timeout?: number;
}

export const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
} satisfies Viewports;

export const defaultStyles = {
  light: { "--color-canvas": "oklch(99.33% 0.0011 197.14)" },
  dark: { "--color-canvas": "oklch(19.34% 0.0091 264.28)" },
} satisfies Styles;

function getCombinedClip(a: Rect, b: Rect) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

function areRectsEqual(a: Rect, b: Rect) {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

function applyClipMargin(rect: Rect, margin = DEFAULT_CLIP_MARGIN) {
  const newX = Math.max(0, rect.x - margin);
  const newY = Math.max(0, rect.y - margin);
  const deltaX = newX - (rect.x - margin);
  const deltaY = newY - (rect.y - margin);
  return {
    x: newX,
    y: newY,
    width: Math.max(0, rect.width + margin * 2 - deltaX),
    height: Math.max(0, rect.height + margin * 2 - deltaY),
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
      // Ignore visually hidden elements. They collapse to a 1px absolutely
      // positioned box clipped to nothing, either via the legacy `clip`
      // property or the modern `clip-path`, so exclude both so they don't
      // stretch the captured region toward the page corner.
      if (rect.width <= 1 && rect.height <= 1) {
        const style = window.getComputedStyle(el);
        if (
          (style.clip !== "auto" || style.clipPath !== "none") &&
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

/**
 * Reads the element boxes that the captured clip comes from. Firefox reports
 * these boxes with 32-bit float corners, which can round a clip one pixel
 * larger than getBoundingClientRect would.
 */
async function readBoundingBoxes(locator: Locator, fullPage: boolean) {
  // Typed as nullable to share the type of readClientBoxes.
  const rects: Array<Rect | null> = [];
  for (const element of await locator.all()) {
    const bounds = await element.boundingBox();
    invariant(bounds, "Element not visible");
    rects.push(bounds);
  }
  // A clip that is not full-page does not use the scroll position.
  if (!fullPage) {
    return { rects, scroll: { x: 0, y: 0 } };
  }
  const scroll = await locator
    .page()
    .evaluate(() => ({ x: scrollX, y: scrollY }));
  return { rects, scroll };
}

/**
 * Reads every element box and the scroll position in one evaluation. The boxes
 * can differ from boundingBox below a pixel and are relative to the element's
 * own frame, so they only serve to detect a clip that is still changing.
 */
async function readClientBoxes(locator: Locator) {
  // TODO: Use locator.evaluateAll again once Playwright's Firefox build stops
  // crashing the page. With Playwright 1.65.0, evaluateAll crashes Firefox when
  // another locator call already resolved the same getByRole locator with a
  // name, and the element has aria-labelledby. Element handles avoid that.
  // https://github.com/microsoft/playwright/issues/43967
  // The clip polling reads the boxes many times per capture, and each read
  // would otherwise keep its handles until the page navigates.
  await using handles = new AsyncDisposableStack();
  const elements = await locator.elementHandles();
  for (const element of elements) {
    handles.use(element);
  }
  return await locator.page().evaluate(
    (nodes) => ({
      rects: nodes.map((node) => {
        // Locators only match elements, but the handles are typed as nodes. An
        // element in a frame comes from another realm, so the check reads the
        // node type rather than using instanceof.
        if (node.nodeType !== Node.ELEMENT_NODE) return null;
        const element = node as Element;
        // An element without layout boxes, such as one with display: none, is
        // where Playwright's boundingBox returns null.
        if (!element.getClientRects().length) return null;
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      }),
      scroll: { x: scrollX, y: scrollY },
    }),
    elements,
  );
}

async function getScreenshotClip(
  page: Page,
  options: Pick<ScreenshotOptions, "element" | "clipMargin" | "fullPage">,
  readBoxes: typeof readBoundingBoxes = readBoundingBoxes,
) {
  const { element, clipMargin, fullPage } = options;
  if (!element) {
    if (fullPage) return null;
    return getBodyClip(page, clipMargin);
  }
  const locator = typeof element === "string" ? page.locator(element) : element;
  const { rects, scroll } = await readBoxes(locator, !!fullPage);
  let rect: Rect | null = null;
  for (const bounds of rects) {
    invariant(bounds, "Element not visible");
    rect = rect ? getCombinedClip(rect, bounds) : bounds;
  }
  invariant(rect, "Element not visible");
  if (!fullPage) {
    return applyClipMargin(rect, clipMargin);
  }
  // The element boxes are viewport-relative. Playwright trims a full-page clip
  // to the document rather than the viewport, and reads it in document
  // coordinates.
  return applyClipMargin(
    { ...rect, x: rect.x + scroll.x, y: rect.y + scroll.y },
    clipMargin,
  );
}

async function waitForStableScreenshotClip(
  page: Page,
  options: Pick<ScreenshotOptions, "element" | "clipMargin" | "fullPage">,
) {
  // A whole-page capture has no clip to stabilize. An element capture still
  // does, even in full-page mode.
  if (options.fullPage && !options.element) {
    return;
  }
  // Some previews update their layout a few frames after they become visible.
  // Wait until the computed clip stays unchanged for a short window. The
  // polling only compares clips, so it reads them in one evaluation each.
  let previousClip = await getScreenshotClip(page, options, readClientBoxes);
  let lastClip = previousClip;
  let stableSince = Date.now();
  const deadline = Date.now() + CLIP_STABILITY_TIMEOUT;
  while (Date.now() < deadline) {
    await page.waitForTimeout(CLIP_STABILITY_INTERVAL);
    const clip = await getScreenshotClip(page, options, readClientBoxes);
    lastClip = clip;
    if (previousClip && clip && areRectsEqual(previousClip, clip)) {
      if (Date.now() - stableSince >= CLIP_STABILITY_DURATION) {
        return;
      }
      continue;
    }
    stableSince = Date.now();
    previousClip = clip;
  }
  console.debug("waitForStableScreenshotClip timed out", {
    clipStabilityTimeout: CLIP_STABILITY_TIMEOUT,
    clipStabilityDuration: CLIP_STABILITY_DURATION,
    stableFor: Date.now() - stableSince,
    previousClip,
    lastClip,
  });
}

async function getPlaywrightScreenshotOptions(
  page: Page,
  options: Pick<ScreenshotOptions, "element" | "clipMargin" | "fullPage">,
) {
  const clip = await getScreenshotClip(page, options);
  if (!clip) {
    return {
      animations: "disabled" as const,
      style: screenshotStyle,
      fullPage: true,
    };
  }
  return {
    animations: "disabled" as const,
    style: screenshotStyle,
    // Integer clips keep WebKit's pixel rounding independent of the popup's
    // fractional position, as with batch capture regions.
    // https://github.com/ariakit/ariakit/issues/7752
    clip: getRectsClip([clip], 0),
    fullPage: !!options.fullPage,
  };
}

async function withStyles(
  page: Page,
  styles?: CSSProperties,
  fn?: () => Promise<void>,
) {
  // An empty style object has nothing to apply or restore.
  if (!styles || !Object.keys(styles).length) {
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
  await fn?.();
  // Skip the restore when fn fails. After a test timeout, Playwright closes the
  // page, and the failed restore would replace the error that names the step
  // where the test stopped.
  // https://github.com/ariakit/ariakit/issues/7601
  await page.evaluate((originalStyles) => {
    const el = document.documentElement;
    if (originalStyles) {
      el.setAttribute("style", originalStyles);
    } else {
      el.removeAttribute("style");
    }
  }, originalStyles);
}

async function withViewport(
  page: Page,
  viewport?: ViewportSize,
  fn?: () => Promise<void>,
) {
  const original = page.viewportSize();
  // The page is already at this size, so a resize and restore would only cost
  // two round trips.
  const unchanged =
    original?.width === viewport?.width &&
    original?.height === viewport?.height;
  if (!viewport || unchanged) {
    await fn?.();
    return;
  }
  await page.setViewportSize(viewport);
  await fn?.();
  // Skip the restore when fn fails, as in withStyles.
  if (original) {
    await page.setViewportSize(original);
  }
}

/**
 * Runs `fn` with a viewport as tall and wide as the document, so a full-page
 * capture fits in the viewport.
 */
async function withDocumentViewport(page: Page, fn: () => Promise<void>) {
  const original = page.viewportSize();
  invariant(original, "The page must have a viewport");
  const size = await page.evaluate(() => ({
    width: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ),
    height: Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ),
  }));
  // A document past the capture limits uses a capture beyond the viewport
  // anyway, and a viewport of that size would only slow the capture down.
  if (Math.max(size.width, size.height) > MAX_BATCH_CAPTURE_DIMENSION) {
    await fn();
    return;
  }
  const viewport = {
    width: Math.max(original.width, size.width),
    height: Math.max(original.height, size.height),
  };
  await withViewport(page, viewport, fn);
}

declare global {
  interface Window {
    __releaseScrollAnimations?: () => void;
  }
}

/**
 * Holds the scroll-driven animations of the document at their current values
 * until `__releaseScrollAnimations` runs. Playwright's `animations: "disabled"`
 * skips an animation with a zero playback rate, and important rules with the
 * current values keep it in place while the rate is zero. Playwright evaluates
 * this in each frame, so it must not use anything outside of its body.
 */
function holdScrollAnimations() {
  const timingKeys = new Set([
    "offset",
    "computedOffset",
    "easing",
    "composite",
  ]);
  const toPropertyName = (key: string) => {
    if (key.startsWith("--")) {
      return key;
    }
    if (key === "cssFloat") return "float";
    return key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
  };
  // Chromium and WebKit leave custom properties out of the keyframes of a CSS
  // animation, so they come from its @keyframes rule.
  const customProperties = new Map<string, Set<string>>();
  const readRules = (list: CSSRuleList) => {
    for (const rule of list) {
      if (rule instanceof CSSKeyframesRule) {
        const names = customProperties.get(rule.name) ?? new Set<string>();
        for (const keyframe of rule.cssRules) {
          if (!(keyframe instanceof CSSKeyframeRule)) continue;
          for (const name of keyframe.style) {
            if (name.startsWith("--")) {
              names.add(name);
            }
          }
        }
        customProperties.set(rule.name, names);
      } else if (rule instanceof CSSGroupingRule) {
        readRules(rule.cssRules);
      }
    }
  };
  for (const sheet of [
    ...document.styleSheets,
    ...document.adoptedStyleSheets,
  ]) {
    try {
      readRules(sheet.cssRules);
    } catch {
      // A cross-origin sheet doesn't expose its rules.
    }
  }
  const rules: string[] = [];
  const held: Array<{ animation: Animation; rate: number }> = [];
  for (const animation of document.getAnimations()) {
    // Animations on the document timeline run in time, not with a scroll.
    if (!animation.timeline) continue;
    if (animation.timeline instanceof DocumentTimeline) continue;
    const effect = animation.effect;
    if (!(effect instanceof KeyframeEffect)) continue;
    const { target, pseudoElement } = effect;
    if (!target) continue;
    // A rule in the document doesn't reach a shadow tree.
    if (target.getRootNode() !== document) continue;
    const properties = new Set(
      effect
        .getKeyframes()
        .flatMap((keyframe) => Object.keys(keyframe))
        .filter((key) => !timingKeys.has(key))
        .map(toPropertyName),
    );
    if (animation instanceof CSSAnimation) {
      for (const name of customProperties.get(animation.animationName) ?? []) {
        properties.add(name);
      }
    }
    const style = getComputedStyle(target, pseudoElement);
    const declarations = [...properties]
      .map((property) => {
        const value = style.getPropertyValue(property);
        return `${property}: ${value} !important;`;
      })
      .join(" ");
    // An element can run more than one animation, so it can hold more marks.
    const mark = `hold-${held.length}`;
    const marks = target.getAttribute("data-visual-hold");
    target.setAttribute("data-visual-hold", marks ? `${marks} ${mark}` : mark);
    const selector = `[data-visual-hold~="${mark}"]${pseudoElement ?? ""}`;
    rules.push(`${selector} { ${declarations} }`);
    held.push({ animation, rate: animation.playbackRate });
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(rules.join("\n"));
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  // A canceled animation would also escape Playwright, but WebKit doesn't
  // follow the scroll again when it plays after the capture.
  for (const { animation } of held) {
    animation.playbackRate = 0;
  }
  window.__releaseScrollAnimations = () => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
      (adopted) => adopted !== sheet,
    );
    for (const element of document.querySelectorAll("[data-visual-hold]")) {
      element.removeAttribute("data-visual-hold");
    }
    for (const { animation, rate } of held) {
      animation.playbackRate = rate;
    }
    delete window.__releaseScrollAnimations;
  };
}

/**
 * Runs `fn` with the scroll-driven animations of every frame held at their
 * scroll position.
 */
async function withScrollAnimationsHeld(page: Page, fn: () => Promise<void>) {
  // TODO: Remove once Playwright's `animations: "disabled"` leaves
  // scroll-driven animations alone. It finishes every animation with an end, so
  // scroll buttons drew in the wrong state: Firefox 159 showed them on strips
  // that don't scroll, and Chromium hid them on strips that do. Visonaut always
  // captures with that option.
  const frames = page.frames().filter((frame) => !frame.isDetached());
  await Promise.all(
    frames.map((frame) => frame.evaluate(holdScrollAnimations)),
  );
  await fn();
  // Skip the release when fn fails, as in withStyles.
  await Promise.all(
    frames
      .filter((frame) => !frame.isDetached())
      .map((frame) =>
        frame.evaluate(() => window.__releaseScrollAnimations?.()),
      ),
  );
}

/**
 * Waits until no web font on the page is loading. Firefox can leave
 * `document.fonts` loading after a navigation when no font face is loading, and
 * `document.fonts.ready` then never settles, so this reads each face instead.
 * https://github.com/ariakit/ariakit/issues/7597
 */
export async function waitForFonts(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          // A layout flush starts the loads of the fonts that the current
          // styles need.
          document.documentElement.getBoundingClientRect();
          return [...document.fonts]
            .filter((face) => face.status === "loading")
            .map((face) => `${face.family} ${face.unicodeRange}`);
        }),
      { message: "Font faces still loading", timeout: FONTS_TIMEOUT },
    )
    .toEqual([]);
}

interface CaptureRegionsParams extends Pick<
  ScreenshotOptions,
  "item" | "clipMargin" | "timeout"
> {
  page: Page;
  regions: ScreenshotRegion[];
  variant: Variant;
}

async function captureRegions({
  page,
  item,
  regions,
  clipMargin,
  variant,
  timeout,
}: CaptureRegionsParams) {
  const prepareRegion = async (region: ScreenshotRegion) => {
    const options = { element: region.element, clipMargin, fullPage: true };
    await waitForStableScreenshotClip(page, options);
    const clip = await getScreenshotClip(page, options);
    invariant(clip, "Missing screenshot region");
    // Batch crops index image pixels, so fractional CSS bounds need rounding.
    return { item: `${item}/${region.name}`, clip: getRectsClip([clip], 0) };
  };
  const size = await page.evaluate(() => ({
    width: Math.max(
      innerWidth,
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ),
    height: Math.max(
      innerHeight,
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ),
  }));
  // Large documents still use clipped captures within the image size limits.
  if (
    size.width > MAX_BATCH_CAPTURE_DIMENSION ||
    size.height > MAX_BATCH_CAPTURE_DIMENSION ||
    size.width * size.height > MAX_BATCH_CAPTURE_PIXELS
  ) {
    for (const region of regions) {
      const { item, clip } = await prepareRegion(region);
      await captureVisual(page, {
        item,
        variant,
        timeout,
        screenshot: { fullPage: true, clip, style: screenshotStyle },
      });
    }
    return;
  }
  const items = await Promise.all(regions.map(prepareRegion));
  await captureVisualBatch(page, {
    variant,
    items,
    timeout,
    screenshot: { style: screenshotStyle },
  });
}

export async function visual(
  page: Page,
  options: ScreenshotOptions,
  testInfo = test.info(),
) {
  expect(
    testInfo.tags,
    "When running visual tests, the test title should contain @visual",
  ).toContain("@visual");

  if (!process.env.VISUAL_TEST || !process.env.CI) {
    return;
  }

  await page.emulateMedia({ reducedMotion: "reduce" });

  const {
    item,
    framework: selectedFramework,
    viewports = { default: page.viewportSize()! },
    styles = defaultStyles,
    style: defaultStyle = {},
    element,
    regions,
    clipMargin = DEFAULT_CLIP_MARGIN,
    fullPage = false,
    timeout,
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
          await page.waitForLoadState("domcontentloaded");
          await waitForFonts(page);
          if ((fullPage && element) || regions) {
            // Sticky and fixed parts paint at the current scroll position, so a
            // document capture taken while scrolled would draw them over the
            // element.
            await page.evaluate(() => window.scrollTo(0, 0));
          }
          await waitForStableScreenshotClip(page, {
            element,
            clipMargin,
            fullPage,
          });
          invariant(
            testInfo.project.metadata.visonaut?.profile,
            "The visual job must measure its Visonaut profile",
          );
          const browser = page.context().browser();
          invariant(browser, "Visonaut requires a connected browser");
          const browserName = browser.browserType().name();
          if (
            browserName !== "chromium" &&
            browserName !== "firefox" &&
            browserName !== "webkit"
          ) {
            throw new Error(`Unsupported browser: ${browserName}`);
          }
          const framework =
            selectedFramework ??
            testInfo.tags.map((tag) => tag.slice(1)).find(isFramework);
          const media = await page.evaluate(() => ({
            colorScheme: matchMedia("(prefers-color-scheme: dark)").matches
              ? ("dark" as const)
              : ("light" as const),
            contrast: matchMedia("(prefers-contrast: more)").matches
              ? ("more" as const)
              : ("no-preference" as const),
            forcedColors: matchMedia("(forced-colors: active)").matches
              ? ("active" as const)
              : ("none" as const),
          }));
          const captureOptions = {
            variant: {
              key: [
                framework,
                testInfo.project.name,
                viewportName,
                styleName,
                media.colorScheme,
                media.contrast,
                media.forcedColors,
              ]
                .filter(Boolean)
                .join("-"),
              browser: browserName,
              ...(framework && { framework }),
              ...media,
              dimensions: {
                project: testInfo.project.name,
                viewport: viewportName,
                style: styleName,
              },
            } satisfies Variant,
            timeout,
          };
          const capture = () =>
            withScrollAnimationsHeld(page, async () => {
              if (regions) {
                await captureRegions({
                  page,
                  item,
                  regions,
                  clipMargin,
                  ...captureOptions,
                });
                return;
              }
              const screenshotOptions = await getPlaywrightScreenshotOptions(
                page,
                { element, clipMargin, fullPage },
              );
              await captureVisual(page, {
                item,
                ...captureOptions,
                screenshot: screenshotOptions,
              });
            });
          // TODO: Capture in the current viewport again once Chromium keeps the
          // emulated forced colors in a capture beyond the viewport, which
          // Playwright takes for a full page that doesn't fit the viewport.
          // Chromium 158 draws that capture without forced colors.
          const capturesPage = !!regions || fullPage;
          if (
            browserName === "chromium" &&
            media.forcedColors === "active" &&
            capturesPage
          ) {
            await withDocumentViewport(page, async () => {
              await waitForStableScreenshotClip(page, {
                element,
                clipMargin,
                fullPage,
              });
              await capture();
            });
            return;
          }
          await capture();
        });
      }
    });
  }
}
