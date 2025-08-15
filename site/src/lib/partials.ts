import type { Response as CfResponse } from "@cloudflare/workers-types";
import type { APIContext, MiddlewareNext } from "astro";
import { trimRight } from "./string.ts";
import { getPartialURLItemId } from "./url.ts";

export function getCacheKey(url: URL) {
  const nextUrl = new URL(`${trimRight(url.pathname, "/")}/`, url);
  const itemId = getPartialURLItemId(url);
  if (itemId) {
    nextUrl.searchParams.set("item", itemId);
  }
  return nextUrl.toString();
}

export function getHashKey(url: URL) {
  return getCacheKey(url).replace(url.origin, "");
}

export function getHashFromHeader(headers: Headers) {
  return headers.get("x-content-hash");
}

export function setHashToHeader(headers: Headers, hash: string) {
  headers.set("x-content-hash", hash);
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeHtmlForHash(html: string) {
  let text = html.replace(/\r\n?/g, "\n");
  // Normalize CSP nonces which may be regenerated per request
  text = text.replace(/\bnonce\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, 'nonce=""');
  return text;
}

async function getHash(bodyBuffer: ArrayBuffer) {
  const html = new TextDecoder("utf-8").decode(bodyBuffer);
  const normalized = normalizeHtmlForHash(html);
  const bytes = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(hashBuffer);
}

function ensureCacheHeaders(headers: Headers) {
  // Avoid caching personalized content
  headers.delete("set-cookie");
  if (!headers.has("Cache-Control")) {
    // CDN: 1y; Browser: 0 (revalidate via CDN)
    headers.set("Cache-Control", "public, s-maxage=31536000, max-age=0");
  }
}

interface CachePartialsParams {
  context: APIContext;
  hashes: Record<string, string>;
  next: MiddlewareNext;
}

export async function cachePartials({
  context,
  hashes,
  next,
}: CachePartialsParams) {
  if (context.request.method !== "GET") {
    return next();
  }

  const runtime = context.locals.runtime;
  const cache = !import.meta.env.DISABLE_CACHE
    ? runtime.caches.default
    : undefined;

  const requestUrl = new URL(context.request.url);
  const cacheKey = getCacheKey(requestUrl);
  const hashKey = getHashKey(requestUrl);

  const cached = cache ? await cache.match(cacheKey) : undefined;
  if (cached) {
    const cachedHeaders = new Headers(Array.from(cached.headers.entries()));
    const body = await cached.arrayBuffer();
    let cachedHash = getHashFromHeader(cachedHeaders);
    if (!cachedHash) {
      cachedHash = await getHash(body);
      setHashToHeader(cachedHeaders, cachedHash);
    }
    const expectedHash = hashes[hashKey];
    if (expectedHash === cachedHash) {
      return new Response(body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: cachedHeaders,
      });
    }
    // If no expected hash or mismatch, fall through to regenerate
  }

  const response = await next();
  if (!response.ok) return response;

  const responseHeaders = new Headers(Array.from(response.headers.entries()));
  ensureCacheHeaders(responseHeaders);

  const buffer = await response.arrayBuffer();
  const hash = await getHash(buffer);
  setHashToHeader(responseHeaders, hash);

  const nextResponse = new Response(buffer, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });

  if (cache) {
    const responseForCache = nextResponse as unknown as CfResponse;
    const waitUntil = runtime.ctx.waitUntil;
    waitUntil(cache.put(cacheKey, responseForCache));
  }

  return nextResponse;
}
