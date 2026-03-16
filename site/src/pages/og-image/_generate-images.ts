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
import type { Page } from "playwright";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import type { OGImageItem } from "./api.ts";

const BASE_URL = "http://localhost:4321";
const PUBLIC_DIR = path.resolve(process.cwd(), "public");

// Maximum fraction of pixels allowed to differ before the image is
// considered changed. This avoids committing images that only differ
// due to sub-pixel rendering or anti-aliasing across runs.
const MAX_DIFF_PIXEL_RATIO = 0.001;

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

async function waitForImageReady(page: Page) {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}

async function generateImage(page: Page, item: OGImageItem) {
  const url = `${BASE_URL}/og-image${item.path}`;

  try {
    await page.goto(url, { waitUntil: "commit" });
    await waitForImageReady(page);
    const imagePath = path.join(PUBLIC_DIR, item.imagePath);
    const buffer = await page.screenshot({ type: "png", timeout: 60_000 });
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
