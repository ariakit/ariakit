import type { Page, PageScreenshotOptions, TestInfo } from "@playwright/test";
import type { ScreenshotOptions } from "./visual.ts";

/** Captures the state prepared by the existing Ariakit visual helpers. */
export async function captureAriviso(
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
  const item =
    options.item ??
    testInfo.annotations.find(
      (annotation) => annotation.type === "ariviso:item",
    )?.description;
  const framework =
    options.framework ??
    testInfo.annotations.find(
      (annotation) => annotation.type === "ariviso:framework",
    )?.description;
  if (!item || !framework) {
    throw new Error("Ariviso captures require an explicit item and framework");
  }
  const browser = page.context().browser()?.browserType().name();
  if (!browser) throw new Error("Ariviso requires a connected browser");
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
  // The diagnostic job installs a checksum-pinned tarball. Ordinary tests do
  // not need an unpublished package, and never load the adapter.
  const packageName: string = "@ariviso/playwright";
  const adapter: unknown = await import(packageName);
  if (
    !adapter ||
    typeof adapter !== "object" ||
    !("visual" in adapter) ||
    typeof adapter.visual !== "function"
  ) {
    throw new Error("The pinned Ariviso capture adapter is not installed");
  }
  await adapter.visual(page, {
    item: `${item}/${options.capture ?? "main"}`,
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
