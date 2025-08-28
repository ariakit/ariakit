import path from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";

interface ViewportSize {
  width: number;
  height: number;
}

interface ScreenshotVariant {
  name: string;
  viewport?: ViewportSize;
  htmlStyles?: Record<string, string | number>;
}

interface SizeVariant {
  name: string;
  viewport?: ViewportSize;
}

interface StyleVariant {
  name: string;
  htmlStyles?: Record<string, string | number>;
}

interface ScreenshotOptions {
  // New API: separate size and style variants
  sizeVariants?: SizeVariant[];
  styleVariants?: StyleVariant[];
  // Back-compat with previous API, processed if provided
  variants?: ScreenshotVariant[];
  // Overrides the default selector to capture. Default is auto-cropped full page.
  locatorSelector?: string;
  // Optional CSS properties to apply to <html> for all variants
  htmlStyles?: Record<string, string | number>;
  // Additional identifier to disambiguate snapshots (e.g., path slug)
  id?: string;
  // Margin (px) around auto-cropped content when not using locatorSelector
  clipMargin?: number;
}

const DEFAULT_SIZE_VARIANTS: SizeVariant[] = [
  { name: "desktop", viewport: { width: 1280, height: 800 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
];

const DEFAULT_STYLE_VARIANTS: StyleVariant[] = [
  { name: "default", htmlStyles: {} },
  {
    name: "dark",
    htmlStyles: { "--color-canvas": "oklch(16.34% 0.0091 264.28)" },
  },
];

function sanitizeSlug(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-");
}

function getSnapshotName(params: {
  testInfo: TestInfo;
  id?: string;
  sizeName: string;
  styleName?: string;
}) {
  const parts = [
    sanitizeSlug(params.testInfo.title),
    params.id && sanitizeSlug(params.id ?? ""),
    params.sizeName,
  ];
  const style =
    params.styleName && params.styleName !== "default"
      ? params.styleName
      : null;
  if (style) parts.push(style);
  const baseName = parts.filter(Boolean).join("-");
  return `${baseName}.png`;
}

// No central snapshots dir; using Playwright-managed paths.

async function getAutoClip(
  page: Page,
  margin: number,
): Promise<{ x: number; y: number; width: number; height: number }> {
  return page.evaluate((m) => {
    function unionRect(a: DOMRect, b: DOMRect) {
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const right = Math.max(a.x + a.width, b.x + b.width);
      const bottom = Math.max(a.y + a.height, b.y + b.height);
      return new DOMRect(x, y, right - x, bottom - y);
    }

    const viewport = new DOMRect(0, 0, window.innerWidth, window.innerHeight);

    const nodes = Array.from(
      document.querySelectorAll("body *"),
    ) as HTMLElement[];
    let rects = nodes
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .filter(
        (r) =>
          r.width < viewport.width * 0.98 && r.height < viewport.height * 0.98,
      );

    if (!rects.length) {
      rects = Array.from(document.body.children)
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);
    }

    if (!rects.length) {
      return {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      };
    }

    let rect = rects[0]!;
    for (let i = 1; i < rects.length; i++) rect = unionRect(rect, rects[i]!);

    const x = Math.max(0, Math.floor(rect.x) - m);
    const y = Math.max(0, Math.floor(rect.y) - m);
    const maxW = viewport.width - x;
    const maxH = viewport.height - y;
    const width = Math.min(maxW, Math.ceil(rect.width) + m * 2);
    const height = Math.min(maxH, Math.ceil(rect.height) + m * 2);
    return { x, y, width, height };
  }, margin);
}

async function captureScreenshotBuffer(
  page: Page,
  options: { locatorSelector?: string; clipMargin?: number },
): Promise<Buffer> {
  const { locatorSelector, clipMargin } = options;
  if (locatorSelector) {
    return page.locator(locatorSelector).screenshot({ animations: "disabled" });
  }
  const margin = clipMargin ?? 8;
  const clip = await getAutoClip(page, margin);
  return page.screenshot({ animations: "disabled", clip });
}

// No centralization or cleanup required.

async function applyHtmlStyles(
  page: Page,
  styles?: Record<string, string | number>,
) {
  if (!styles) return;
  await page.evaluate((s) => {
    const el = document.documentElement as HTMLElement;
    if (!el.getAttribute("data-prev-style")) {
      el.setAttribute("data-prev-style", el.getAttribute("style") || "");
    }
    for (const [k, v] of Object.entries(s)) {
      if (k.includes("--") || k.includes("-")) {
        el.style.setProperty(k, String(v));
      } else {
        // @ts-ignore
        el.style[k] = String(v);
      }
    }
  }, styles);
}

async function restoreHtmlStyles(page: Page) {
  await page.evaluate(() => {
    const el = document.documentElement as HTMLElement;
    const prev = el.getAttribute("data-prev-style");
    if (prev !== null) {
      if (prev) el.setAttribute("style", prev);
      else el.removeAttribute("style");
      el.removeAttribute("data-prev-style");
    }
  });
}

async function withViewport(
  page: Page,
  viewport?: ViewportSize,
  fn?: () => Promise<void>,
) {
  const original = page.viewportSize();
  if (!viewport) {
    await fn?.();
    return;
  }
  await page.setViewportSize(viewport);
  try {
    await fn?.();
  } finally {
    if (original) await page.setViewportSize(original);
  }
}

export async function matchScreenshots(
  page: Page,
  testInfo: TestInfo,
  options: ScreenshotOptions = {},
) {
  // Compute variant combos (size x style) with back-compat to legacy `variants`
  type VariantCombo = { size: SizeVariant; style: StyleVariant };
  let combos: VariantCombo[] = [];
  if (options.variants?.length) {
    combos = options.variants.map((v) => ({
      size: { name: v.name, viewport: v.viewport },
      style: { name: "default", htmlStyles: v.htmlStyles },
    }));
  } else {
    const sizes = options.sizeVariants?.length
      ? options.sizeVariants
      : DEFAULT_SIZE_VARIANTS;
    const styles = options.styleVariants?.length
      ? options.styleVariants
      : DEFAULT_STYLE_VARIANTS;
    for (const size of sizes) {
      for (const style of styles) {
        combos.push({ size, style });
      }
    }
  }
  for (const { size, style } of combos) {
    const name = getSnapshotName({
      testInfo,
      id: options.id,
      sizeName: size.name,
      styleName: style.name,
    });
    await withViewport(page, size.viewport, async () => {
      await applyHtmlStyles(page, options.htmlStyles);
      await applyHtmlStyles(page, style.htmlStyles);

      await page.waitForLoadState("domcontentloaded");
      await page.evaluate(() => document.fonts?.ready?.catch(() => {}));

      const buffer = await captureScreenshotBuffer(page, {
        locatorSelector: options.locatorSelector,
        clipMargin: options.clipMargin,
      });

      try {
        expect.soft(buffer).toMatchSnapshot(name);
      } finally {
        await restoreHtmlStyles(page);
      }
    });
  }

  // Snapshot files are managed by Playwright.
}

// --- Test navigation helpers -------------------------------------------------

interface PreviewPathParts {
  framework: string;
  type: "components" | "examples";
  id: string;
  isComponentMain: boolean;
}

function parseFromFilePath(filePath: string): PreviewPathParts | null {
  // Examples:
  // site/src/examples/disclosure/_component/test-browser.ts
  // site/src/examples/checkbox-card/test-browser.ts
  // We want to resolve to:
  // - components: /<framework>/previews/<component-id>/_component
  // - examples:   /<framework>/previews/<example-id>
  const parts = filePath.split(path.sep);
  const siteIdx = parts.lastIndexOf("site");
  if (siteIdx < 0) return null;
  const srcIdx = siteIdx + 1;
  if (parts[srcIdx] !== "src") return null;
  const type = parts[srcIdx + 1] as "components" | "examples";
  if (type !== "components" && type !== "examples") return null;
  const id = parts[srcIdx + 2];
  if (!id) return null;
  const maybeComponent = parts[srcIdx + 3];
  const isComponentMain = maybeComponent === "_component";
  return { framework: "react", type, id, isComponentMain };
}

export async function navigateToPreviewForCurrentTest(
  page: Page,
  testInfo: TestInfo,
) {
  const parsed = parseFromFilePath(testInfo.file);
  if (!parsed)
    throw new Error(`Cannot parse preview path from ${testInfo.file}`);

  const { framework, id, isComponentMain } = parsed;
  const base = `/${framework}/previews/${id}`;
  const pathToGo = isComponentMain ? `${base}/_component` : base;
  await page.goto(pathToGo, { waitUntil: "domcontentloaded" });
}

export type { ScreenshotOptions, ScreenshotVariant, SizeVariant, StyleVariant };
