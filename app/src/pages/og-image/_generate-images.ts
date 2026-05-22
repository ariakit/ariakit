/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import type { Page, Response } from "playwright";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { getFramework } from "#app/lib/frameworks.ts";
import type { OGImageItem } from "./api.ts";

const BASE_URL = process.env.OG_IMAGE_BASE_URL ?? "http://localhost:4321";
const PUBLIC_DIR = path.resolve(process.cwd(), "public");

// Maximum fraction of pixels allowed to differ before the image is
// considered changed. This avoids committing images that only differ
// due to sub-pixel rendering or anti-aliasing across runs.
const MAX_DIFF_PIXEL_RATIO = 0.001;
const MAX_BLANK_PIXEL_RATIO = 0.995;
const MAX_SCREENSHOT_ATTEMPTS = 3;

function getServerError(response: Response) {
  const status = response.status();
  if (status < 500) return;
  return `${status} ${response.request().method()} ${response.url()}`;
}

function assertNoServerErrors(item: OGImageItem, serverErrors: string[]) {
  if (!serverErrors.length) return;
  throw new Error(
    `Server errors while rendering ${item.path}:\n${[
      ...new Set(serverErrors),
    ].join("\n")}`,
  );
}

function isBlankImage(buffer: Buffer) {
  const image = PNG.sync.read(buffer);
  const pixels = image.data;
  const red = pixels[0];
  const green = pixels[1];
  const blue = pixels[2];
  const alpha = pixels[3];
  if (red == null) return false;
  if (green == null) return false;
  if (blue == null) return false;
  if (alpha == null) return false;
  let matchingPixels = 0;
  const totalPixels = image.width * image.height;
  if (!totalPixels) return false;
  for (let i = 0; i < pixels.length; i += 4) {
    const currentRed = pixels[i];
    const currentGreen = pixels[i + 1];
    const currentBlue = pixels[i + 2];
    const currentAlpha = pixels[i + 3];
    if (currentRed == null) continue;
    if (currentGreen == null) continue;
    if (currentBlue == null) continue;
    if (currentAlpha == null) continue;
    if (
      Math.abs(currentRed - red) <= 1 &&
      Math.abs(currentGreen - green) <= 1 &&
      Math.abs(currentBlue - blue) <= 1 &&
      Math.abs(currentAlpha - alpha) <= 1
    ) {
      matchingPixels += 1;
    }
  }
  return matchingPixels / totalPixels >= MAX_BLANK_PIXEL_RATIO;
}

function getExpectedText(item: OGImageItem) {
  if (item.title) {
    return item.title;
  }
  if (item.framework) {
    return getFramework(item.framework).label;
  }
  return undefined;
}

function isWithinTolerance(newBuffer: Buffer, existingPath: string) {
  if (!fs.existsSync(existingPath)) return false;
  try {
    const existingBuffer = fs.readFileSync(existingPath);
    // Byte-identical files need no further comparison.
    if (Buffer.compare(newBuffer, existingBuffer) === 0) return true;
    const existingPng = PNG.sync.read(existingBuffer);
    const newPng = PNG.sync.read(newBuffer);
    if (
      existingPng.width !== newPng.width ||
      existingPng.height !== newPng.height
    ) {
      return false;
    }
    const totalPixels = existingPng.width * existingPng.height;
    const diffCount = pixelmatch(
      existingPng.data,
      newPng.data,
      undefined,
      existingPng.width,
      existingPng.height,
      { threshold: 0.1 },
    );
    return diffCount / totalPixels <= MAX_DIFF_PIXEL_RATIO;
  } catch (error) {
    console.warn(`⚠️  Could not compare ${existingPath}, regenerating`, error);
    return false;
  }
}

async function getItemsToGenerate() {
  const url = `${BASE_URL}/og-image/api`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
    }
    const items: OGImageItem[] = await response.json();
    return items;
  } catch (error) {
    console.error("Please make sure the dev server is running: `pnpm run dev`");
    throw error;
  }
}

async function assertNoErrorOverlay(page: Page, item: OGImageItem) {
  const errorText = await page.evaluate(() => {
    const overlay = document.querySelector("vite-error-overlay");
    if (overlay) {
      return (
        overlay.shadowRoot?.textContent?.trim() ||
        overlay.textContent?.trim() ||
        "Vite error overlay detected"
      );
    }
    const text = document.body.textContent?.trim();
    if (!text) return;
    if (!text.includes("An error occurred.")) return;
    if (!text.includes("Stack Trace")) return;
    return text;
  });
  if (errorText) {
    throw new Error(
      `Error overlay while rendering ${item.path}:\n${errorText.slice(0, 500)}`,
    );
  }
}

async function waitForImageReady(page: Page, item: OGImageItem) {
  await page.waitForLoadState("load");
  await assertNoErrorOverlay(page, item);
  await page.waitForSelector("[data-og-image]");
  const expectedText = getExpectedText(item);
  if (expectedText) {
    await page.waitForFunction(
      (text) => document.body.textContent?.includes(text) ?? false,
      expectedText,
    );
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
  await assertNoErrorOverlay(page, item);
}

async function screenshotImage(page: Page, item: OGImageItem, url: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_SCREENSHOT_ATTEMPTS; attempt += 1) {
    const serverErrors: string[] = [];
    const handleResponse = (response: Response) => {
      const error = getServerError(response);
      if (error) {
        serverErrors.push(error);
      }
    };
    try {
      page.on("response", handleResponse);
      const response = await page.goto(url, { waitUntil: "load" });
      if (response) {
        handleResponse(response);
      }
      assertNoServerErrors(item, serverErrors);
      await waitForImageReady(page, item);
      const buffer = await page.screenshot({ type: "png", timeout: 60_000 });
      assertNoServerErrors(item, serverErrors);
      if (!isBlankImage(buffer)) {
        return buffer;
      }
      lastError = undefined;
    } catch (error) {
      lastError = error;
    } finally {
      page.off("response", handleResponse);
    }
    if (attempt < MAX_SCREENSHOT_ATTEMPTS) {
      await page.waitForTimeout(500 * attempt);
    }
  }
  if (lastError) {
    throw lastError;
  }
  throw new Error(`Blank OG image after ${MAX_SCREENSHOT_ATTEMPTS} attempts`);
}

async function generateImage(page: Page, item: OGImageItem) {
  const url = `${BASE_URL}/og-image${item.path}`;

  try {
    const imagePath = path.join(PUBLIC_DIR, item.imagePath);
    const buffer = await screenshotImage(page, item, url);
    const relativePath = path.relative(PUBLIC_DIR, imagePath);

    if (isWithinTolerance(buffer, imagePath)) {
      console.log(`⏭️  Skipped ${relativePath} (within tolerance)`);
    } else {
      fs.mkdirSync(path.dirname(imagePath), { recursive: true });
      fs.writeFileSync(imagePath, buffer);
      console.log(`✅ Generated ${relativePath}`);
    }
  } catch (e) {
    console.error(`❌ Failed to generate ${item.path}`);
    console.error(e);
    throw e;
  }
}

function removeStaleImages(items: OGImageItem[]) {
  const expectedPaths = new Set(
    items.map((item) => path.join(PUBLIC_DIR, item.imagePath)),
  );
  const ogImageDir = path.join(PUBLIC_DIR, "og-image");
  if (!fs.existsSync(ogImageDir)) return;
  for (const file of fs.readdirSync(ogImageDir)) {
    const filePath = path.join(ogImageDir, file);
    if (expectedPaths.has(filePath)) continue;
    fs.unlinkSync(filePath);
    console.log(`🗑️  Removed stale ${path.relative(PUBLIC_DIR, filePath)}`);
  }
}

async function main() {
  console.log("🔥 Generating OG images");
  // Use the full Chromium channel because headless-shell produces incorrect
  // OG image captures for the repeated thumbnail strip on newer Playwright.
  const browser = await chromium.launch({ channel: "chromium" });
  const context = await browser.newContext({
    viewport: { width: 600, height: 315 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  try {
    const items = await getItemsToGenerate();
    if (!items.length) {
      throw new Error("No OG image items found");
    }
    const failedPaths: string[] = [];
    for (const item of items) {
      try {
        await generateImage(page, item);
      } catch (_error) {
        failedPaths.push(item.path);
      }
    }
    if (failedPaths.length) {
      throw new Error(
        `Failed to generate OG images for: ${failedPaths.join(", ")}`,
      );
    }
    removeStaleImages(items);
    console.log("✨ Done");
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
