/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

// Cloudflare Workers domain for Next.js app
const NEXTJS_WORKERS_DOMAIN = "ariakit-nextjs.workers.dev";
// Production domain for Next.js app
const NEXTJS_PRODUCTION_DOMAIN = "nextjs.ariakit.org";
// Development URL for Next.js app
const NEXTJS_DEV_URL = "http://localhost:3000";

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
    if (hostname === "localhost" || hostname === "127.0.0.1") {
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
 * Regex pattern to match Next.js preview URLs.
 * Matches: /{framework}/previews/{example}/ where example contains "nextjs"
 * Examples:
 * - /react/previews/tab-nextjs/
 * - /react/previews/menu-nextjs-app-router/
 */
export const NEXTJS_PREVIEW_PATTERN =
  /^\/\w+\/previews\/([^/]*nextjs[^/]*)\/?$/i;

/**
 * Checks if a URL path is a Next.js preview that should be redirected.
 * @param pathname - The URL pathname to check
 * @returns The example ID if it's a Next.js preview, null otherwise
 */
export function getNextjsPreviewId(pathname: string): string | null {
  const match = pathname.match(NEXTJS_PREVIEW_PATTERN);
  return match ? (match[1] ?? null) : null;
}
