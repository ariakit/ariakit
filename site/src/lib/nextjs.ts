/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

// Cloudflare Workers domain for Next.js app (same for production and preview)
const NEXTJS_WORKERS_DOMAIN = "ariakit-nextjs.workers.dev";
// Production domain for Next.js app
const NEXTJS_PRODUCTION_URL = "https://nextjs.ariakit.org";
// Development URL for Next.js app
const NEXTJS_DEV_URL = "http://localhost:3000";

/**
 * Gets the base URL for the Next.js app based on the environment.
 * In development, defaults to http://localhost:3000.
 * In production, defaults to https://nextjs.ariakit.org.
 * In preview environments, derives the URL from the current site URL.
 * Can be overridden with the PUBLIC_NEXTJS_URL environment variable.
 */
export function getNextjsBaseUrl(): string {
  // Check process.env first (for Node.js/Playwright context)
  if (typeof process !== "undefined" && process.env?.PUBLIC_NEXTJS_URL) {
    return process.env.PUBLIC_NEXTJS_URL;
  }
  // Check import.meta.env (for Astro context)
  if (import.meta.env?.PUBLIC_NEXTJS_URL) {
    return import.meta.env.PUBLIC_NEXTJS_URL;
  }
  // Determine if we're in development
  const isDev =
    (typeof process !== "undefined" &&
      process.env?.NODE_ENV !== "production") ||
    import.meta.env?.DEV;
  if (isDev) {
    return NEXTJS_DEV_URL;
  }
  // In production/preview, check the site URL to determine if we're on a
  // preview deployment
  const siteUrl = import.meta.env?.SITE;
  if (siteUrl) {
    // Check if we're on a preview deployment (contains workers.dev or has a
    // preview subdomain pattern)
    const isPreview =
      siteUrl.includes("workers.dev") ||
      siteUrl.includes("-preview.") ||
      !siteUrl.includes("next.ariakit.org");
    if (isPreview) {
      // Extract the alias from the site URL if present (e.g.,
      // https://alias.ariakit-preview.workers.dev)
      const match = siteUrl.match(/https?:\/\/([^.]+)\./);
      const alias = match?.[1];
      if (alias && alias !== "ariakit-preview") {
        return `https://${alias}.${NEXTJS_WORKERS_DOMAIN}`;
      }
      return `https://${NEXTJS_WORKERS_DOMAIN}`;
    }
  }
  return NEXTJS_PRODUCTION_URL;
}

/**
 * Generates a full URL for a Next.js preview page.
 * @param path - The path within the Next.js app (e.g., "tab-nextjs")
 * @returns The full URL to the Next.js page
 */
export function getNextjsPreviewUrl(path: string): string {
  const baseUrl = getNextjsBaseUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
