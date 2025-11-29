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
 * Determines if a URL represents a preview deployment by parsing the hostname.
 * Uses proper URL parsing instead of substring matching for security.
 * @param url - The URL to check
 * @returns True if the URL is a preview deployment, false otherwise
 */
function isPreviewDeployment(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    // Workers.dev domain indicates preview deployment
    if (hostname.endsWith(".workers.dev")) {
      return true;
    }
    // Preview subdomain pattern (e.g., pr-123-preview.ariakit.org)
    if (hostname.includes("-preview")) {
      return true;
    }
    // Production domain check - if on ariakit.org, it's not a preview
    return hostname !== "ariakit.org" && !hostname.endsWith(".ariakit.org");
  } catch {
    // If URL parsing fails, assume production (safe default)
    return false;
  }
}

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
  if (siteUrl && isPreviewDeployment(siteUrl)) {
    // Extract the alias from the site URL if present (e.g.,
    // https://alias.ariakit-preview.workers.dev)
    const match = siteUrl.match(/https?:\/\/([^.]+)\./);
    const alias = match?.[1];
    if (alias && alias !== "ariakit-preview") {
      return `https://${alias}.${NEXTJS_WORKERS_DOMAIN}`;
    }
    return `https://${NEXTJS_WORKERS_DOMAIN}`;
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
