/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import path from "node:path";
import type { Browser } from "playwright";
import { chromium } from "playwright";
import type { OGImageItem } from "./api.ts";

const BASE_URL = "http://localhost:4321";
const PUBLIC_DIR = path.resolve(process.cwd(), "public");

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

async function generateImage(browser: Browser, item: OGImageItem) {
  const url = `${BASE_URL}/og-image${item.path}`;
  const page = await browser.newPage({
    viewport: { width: 600, height: 315 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    const imagePath = path.join(PUBLIC_DIR, item.imagePath);
    await page.screenshot({ path: imagePath, type: "png", timeout: 60_000 });
    console.log(`✅ Generated ${path.relative(PUBLIC_DIR, imagePath)}`);
  } catch (e) {
    console.error(`❌ Failed to generate ${item.path}`);
    console.error(e);
    throw e;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("🔥 Generating OG images");
  // Use the full Chromium channel because headless-shell produces incorrect
  // OG image captures for the repeated thumbnail strip on newer Playwright.
  const browser = await chromium.launch({ channel: "chromium" });
  try {
    const items = await getItemsToGenerate();
    if (!items.length) {
      throw new Error("No OG image items found");
    }
    const failedPaths: string[] = [];
    for (const item of items) {
      try {
        await generateImage(browser, item);
      } catch (_error) {
        failedPaths.push(item.path);
      }
    }
    if (failedPaths.length) {
      throw new Error(
        `Failed to generate OG images for: ${failedPaths.join(", ")}`,
      );
    }
    console.log("✨ Done");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
