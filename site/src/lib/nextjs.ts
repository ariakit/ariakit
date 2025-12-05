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
import { basename, dirname, join } from "node:path";

// Cloudflare Workers domain for Next.js app
const NEXTJS_WORKERS_DOMAIN = "ariakit-nextjs.workers.dev";
// Production domain for Next.js app
const NEXTJS_PRODUCTION_DOMAIN = "nextjs.ariakit.org";
// Development URL for Next.js app
const NEXTJS_DEV_URL = "http://localhost:3000";

/**
 * Regex pattern to match Next.js preview URLs.
 * Matches: /{framework}/previews/{example}/ where example contains "nextjs"
 * Examples:
 * - /react/previews/tab-nextjs/
 * - /react/previews/menu-nextjs-app-router/
 */
const NEXTJS_PREVIEW_PATTERN = /^\/\w+\/previews\/([^/]*nextjs[^/]*)\/?$/i;

// Next.js App Router convention files that should be auto-included in the
// source plugin
const NEXTJS_CONVENTION_FILES = [
  "layout.tsx",
  "page.tsx",
  "loading.tsx",
  "error.tsx",
  "not-found.tsx",
  "template.tsx",
  "default.tsx",
] as const;

type NextjsConventionFile = (typeof NEXTJS_CONVENTION_FILES)[number];

/**
 * Derives the Next.js app URL from the current request URL. This allows dynamic
 * URL determination at runtime without needing build-time configuration.
 *
 * URL mapping:
 * - localhost:* → http://localhost:3000
 * - {alias}.ariakit-preview.workers.dev → {alias}.ariakit-nextjs.workers.dev
 * - ariakit-preview.workers.dev → ariakit-nextjs.workers.dev
 * - next.ariakit.org → nextjs.ariakit.org
 * - *.ariakit.org → nextjs.ariakit.org
 *
 * @param requestUrl - The current request URL (e.g., from Astro context)
 * @param path - The path within the Next.js app (e.g., "/tab-nextjs")
 * @returns The full URL to the Next.js page
 */
export function getNextjsUrlFromRequest(
  requestUrl: string,
  path: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  try {
    const url = new URL(requestUrl);
    const { hostname, protocol } = url;
    // Development: localhost
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0"
    ) {
      return `${NEXTJS_DEV_URL}${normalizedPath}`;
    }
    // Preview deployment on workers.dev
    if (hostname.endsWith(".workers.dev")) {
      // Extract alias if present (e.g., pr-123.ariakit-preview.workers.dev)
      const match = hostname.match(/^([^.]+)\.ariakit-preview\.workers\.dev$/);
      if (match) {
        const alias = match[1];
        return `${protocol}//${alias}.${NEXTJS_WORKERS_DOMAIN}${normalizedPath}`;
      }
      // No alias, use main workers domain
      return `${protocol}//${NEXTJS_WORKERS_DOMAIN}${normalizedPath}`;
    }
    // Production or custom domain on ariakit.org
    if (hostname.endsWith(".ariakit.org") || hostname === "ariakit.org") {
      return `${protocol}//${NEXTJS_PRODUCTION_DOMAIN}${normalizedPath}`;
    }
    // Fallback: replace hostname with production Next.js domain
    return `${protocol}//${NEXTJS_PRODUCTION_DOMAIN}${normalizedPath}`;
  } catch {
    // If URL parsing fails, fallback to production
    return `https://${NEXTJS_PRODUCTION_DOMAIN}${normalizedPath}`;
  }
}

/**
 * Checks if a URL path is a Next.js preview that should be redirected.
 * @param pathname - The URL pathname to check
 * @returns The example ID if it's a Next.js preview, null otherwise
 */
export function getNextjsPreviewId(pathname: string): string | null {
  const match = pathname.match(NEXTJS_PREVIEW_PATTERN);
  return match ? (match[1] ?? null) : null;
}

/**
 * Checks if a filename is a Next.js App Router convention file.
 */
export function isNextjsConventionFile(
  filename: string,
): filename is NextjsConventionFile {
  return NEXTJS_CONVENTION_FILES.includes(filename as NextjsConventionFile);
}

/**
 * Finds sibling Next.js convention files in the same directory as the given
 * file. Returns absolute paths to existing convention files, excluding the
 * entry file itself.
 */
export async function findSiblingConventionFiles(
  entryFilePath: string,
): Promise<string[]> {
  const dir = dirname(entryFilePath);
  const entryFilename = basename(entryFilePath);
  const siblingFiles: string[] = [];
  for (const conventionFile of NEXTJS_CONVENTION_FILES) {
    if (conventionFile === entryFilename) continue;
    const filePath = join(dir, conventionFile);
    try {
      await fs.promises.access(filePath);
      siblingFiles.push(filePath);
    } catch {
      // File doesn't exist, skip
    }
  }
  return siblingFiles;
}

/**
 * Recursively finds nested route directories and their convention files.
 * Returns absolute paths to all convention files found in nested directories.
 */
export async function findNestedRouteFiles(baseDir: string): Promise<string[]> {
  const nestedFiles: string[] = [];
  const scanDirectory = async (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip special directories
        if (entry.name.startsWith(".")) continue;
        if (entry.name === "node_modules") continue;
        // Recursively scan subdirectory
        await scanDirectory(fullPath);
      } else if (entry.isFile() && isNextjsConventionFile(entry.name)) {
        nestedFiles.push(fullPath);
      }
    }
  };
  // Start scanning from subdirectories of the base directory
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(baseDir, { withFileTypes: true });
  } catch {
    return nestedFiles;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "node_modules") continue;
    await scanDirectory(join(baseDir, entry.name));
  }
  return nestedFiles;
}
