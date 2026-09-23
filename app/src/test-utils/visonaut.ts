import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "@playwright/test";
import type { Page, PageScreenshotOptions, TestInfo } from "@playwright/test";
import { slugify } from "#app/lib/string.ts";
import type { ScreenshotOptions } from "./visual.ts";

/** Declares an item identity separately from a test's display title. */
export function setVisonautItem(item: string) {
  const info = test.info();
  if (
    info.annotations.some((annotation) => annotation.type === "visonaut:item")
  ) {
    throw new Error("Visonaut item was declared more than once in one test");
  }
  info.annotations.push({ type: "visonaut:item", description: item });
}

/** Captures the state prepared by the existing Ariakit visual helpers. */
export async function captureVisonaut(
  page: Page,
  params: {
    options: ScreenshotOptions;
    screenshot: PageScreenshotOptions;
    viewport: string;
    style: string;
    testInfo: TestInfo;
  },
) {
  const { options, screenshot, viewport, style, testInfo } = params;
  const lookup =
    options.item ??
    testInfo.annotations.find(
      (annotation) => annotation.type === "visonaut:item",
    )?.description;
  const framework =
    options.framework ??
    testInfo.annotations.find(
      (annotation) => annotation.type === "visonaut:framework",
    )?.description;
  if (!lookup || !framework) {
    throw new Error("Visonaut captures require an explicit item and framework");
  }
  const capture = (
    options.capture ??
    (!options.item ? options.id : undefined) ??
    "main"
  )
    .split("/")
    .map(slugify)
    .filter(Boolean)
    .join("/");
  if (!capture) {
    throw new Error("Cannot derive a stable Visonaut capture identity");
  }
  const browser = page.context().browser()?.browserType().name();
  if (!browser) throw new Error("Visonaut requires a connected browser");
  const executorDirectory = process.env.VISONAUT_EXECUTOR_DIRECTORY;
  if (!executorDirectory || !path.isAbsolute(executorDirectory)) {
    throw new Error("The Visonaut capture adapter is not installed");
  }
  const item = `${lookup}/${capture}`;
  if (
    !["chromium", "firefox", "webkit"].includes(browser) ||
    item.length > 256
  ) {
    throw new Error(`Invalid Visonaut item or browser: ${item}`);
  }
  const media = await page.evaluate(() => ({
    colorScheme: matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
    contrast: matchMedia("(prefers-contrast: more)").matches
      ? "more"
      : "no-preference",
    forcedColors: matchMedia("(forced-colors: active)").matches
      ? "active"
      : "none",
  }));
  // The trusted executor installs the checksum-pinned package outside the
  // candidate checkout. Playwright does not resolve that package from app/.
  const adapterEntry = pathToFileURL(
    path.join(
      executorDirectory,
      "node_modules/@visonaut/playwright/dist/index.js",
    ),
  ).href;
  const adapter: unknown = await import(adapterEntry);
  if (
    !adapter ||
    typeof adapter !== "object" ||
    !("visual" in adapter) ||
    typeof adapter.visual !== "function"
  ) {
    throw new Error("The pinned Visonaut capture adapter is not installed");
  }
  await adapter.visual(page, {
    item,
    variant: {
      key: [
        browser,
        framework,
        viewport,
        style,
        media.colorScheme,
        media.contrast,
        media.forcedColors,
      ].join("/"),
      browser,
      framework,
      ...media,
      dimensions: { viewport, style },
    },
    timeout: options.timeout,
    screenshot: {
      clip: screenshot.clip,
      fullPage: screenshot.fullPage,
      scale: "css",
    },
  });
}
