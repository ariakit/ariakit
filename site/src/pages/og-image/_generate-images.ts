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
      console.error(`Failed to fetch from ${url}: ${response.statusText}`);
      console.error(
        "Please make sure the dev server is running: `npm run dev`",
      );
      return [];
    }
    const items: OGImageItem[] = await response.json();
    return items;
  } catch (_e) {
    console.error(`Failed to fetch from ${url}`);
    console.error("Please make sure the dev server is running: `npm run dev`");
    return [];
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
    await page.screenshot({ path: imagePath, type: "png" });
    console.log(`✅ Generated ${path.relative(PUBLIC_DIR, imagePath)}`);
  } catch (e) {
    console.error(`❌ Failed to generate ${item.path}`);
    console.error(e);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("🔥 Generating OG images");
  const browser = await chromium.launch();
  try {
    const items = await getItemsToGenerate();
    if (!items.length) return;
    const promises = items.map((item) => generateImage(browser, item));
    await Promise.all(promises);
    console.log("✨ Done");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
