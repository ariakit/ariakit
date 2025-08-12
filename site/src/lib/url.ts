/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { CollectionEntry } from "astro:content";
import { isFramework } from "./frameworks.ts";
import {
  getReferenceItem,
  getReferenceItemId,
  getReferenceSlug,
  type ReferenceItem,
} from "./reference.ts";
import {
  type PlusAccountPath,
  type PlusCheckoutStep,
  PlusCheckoutStepSchema,
  type PlusType,
  PlusTypeSchema,
} from "./schemas.ts";

const DEFAULT_URL = new URL("http://localhost:4321");
const PLUS_ACCOUNT_PATH = "/plus/account";
const PLUS_CHECKOUT_PATH = "/plus/checkout";
const COMPONENTS_PATH = "/components";
const LEGACY_REFERENCE_PATH = "/reference";

function leadingSlash(path?: string | null) {
  return path ? `/${path}` : "";
}

function setRedirectURL(url: URL, redirectUrl?: string | URL) {
  if (!redirectUrl) return;
  const path = new URL(redirectUrl, url).toString().replace(url.origin, "");
  url.searchParams.set("redirect_url", encodeURIComponent(path));
}

export interface GetPlusAccountURLParams {
  url: string | URL;
  path?: PlusAccountPath;
  redirectUrl?: string | URL;
}

export function getPlusAccountURL({
  url,
  path,
  redirectUrl,
}: GetPlusAccountURLParams) {
  const nextUrl = new URL(url, DEFAULT_URL);
  nextUrl.pathname = `${PLUS_ACCOUNT_PATH}${leadingSlash(path)}`;
  setRedirectURL(nextUrl, redirectUrl);
  return nextUrl;
}

export function getPlusAccountPath(
  params: Partial<GetPlusAccountURLParams> = {},
) {
  const url = getPlusAccountURL({ url: DEFAULT_URL, ...params });
  return url.toString().replace(url.origin, "");
}

export interface GetPlusCheckoutURLParams {
  url: string | URL;
  type?: PlusType;
  step?: PlusCheckoutStep;
  redirectUrl?: string | URL;
}

export function getPlusCheckoutURL({
  url,
  step,
  type,
  redirectUrl,
}: GetPlusCheckoutURLParams) {
  const { step: _step = "login", type: _type = "personal" } =
    parsePlusCheckoutURL(url);
  type = type ?? _type;
  step = step ?? _step;
  const nextUrl = new URL(url, DEFAULT_URL);
  nextUrl.pathname = `${PLUS_CHECKOUT_PATH}${leadingSlash(step)}${leadingSlash(type)}`;
  setRedirectURL(nextUrl, redirectUrl);
  return nextUrl;
}

export function getPlusCheckoutPath(
  params: Partial<GetPlusCheckoutURLParams> = {},
) {
  const url = getPlusCheckoutURL({ url: DEFAULT_URL, ...params });
  return url.toString().replace(url.origin, "");
}

export function parsePlusCheckoutURL(url: string | URL) {
  const nextUrl = new URL(url, DEFAULT_URL);
  const [, , , maybeStep, maybeType] = nextUrl.pathname.split("/");
  const parsedStep = PlusCheckoutStepSchema.safeParse(maybeStep);
  const parsedType = PlusTypeSchema.safeParse(maybeType);
  const step = parsedStep.success ? parsedStep.data : undefined;
  const type = parsedType.success ? parsedType.data : undefined;
  return { step, type };
}

export interface GetReferenceURLParams {
  reference: CollectionEntry<"references">;
  item?: string;
  url?: string | URL;
}

export function getReferenceURL({
  reference,
  item,
  url,
}: GetReferenceURLParams) {
  const { framework, component } = reference.data;
  const slug = getReferenceSlug(reference);
  if (item && !getReferenceItem(reference.data, item)) return;
  const nextUrl = new URL(url ?? DEFAULT_URL);
  const slugPath = slug ? `/${slug}` : "";
  nextUrl.pathname = `/${framework}${COMPONENTS_PATH}/${component}${slugPath}/`;
  nextUrl.hash = item ? `#${item}` : "";
  return nextUrl;
}

export interface GetReferencePathParams {
  reference: CollectionEntry<"references">;
  item?: string;
}

export function getReferencePath({ reference, item }: GetReferencePathParams) {
  const url = getReferenceURL({ reference, item });
  return url?.toString().replace(url.origin, "");
}

function getReferenceURLSegments(url: string | URL) {
  const nextUrl = new URL(url, DEFAULT_URL);
  const [framework, collection, component, slug, ...rest] = nextUrl.pathname
    .split("/")
    .filter(Boolean);
  if (rest.length) return null;
  if (!framework) return null;
  if (!component) return null;
  if (!slug) return null;
  if (`/${collection}` !== COMPONENTS_PATH) return null;
  return { framework, collection, component, slug };
}

function getLegacyReferenceURLSegments(url: string | URL) {
  const nextUrl = new URL(url, DEFAULT_URL);
  const [maybeLegacy, slug, ...rest] = nextUrl.pathname
    .split("/")
    .filter(Boolean);
  if (rest.length) return null;
  if (maybeLegacy !== LEGACY_REFERENCE_PATH.slice(1)) return null;
  if (!slug) return null;
  return { slug };
}

export interface ParseReferenceURLResult {
  reference: CollectionEntry<"references">;
  item?: ReferenceItem;
}

export function parseReferenceURL(
  url: string | URL,
  references: CollectionEntry<"references">[],
): ParseReferenceURLResult | null {
  const nextUrl = new URL(url, DEFAULT_URL);
  const segments = getReferenceURLSegments(nextUrl);
  if (!segments) {
    // Legacy: /reference/{slug}
    const legacy = getLegacyReferenceURLSegments(nextUrl);
    if (!legacy) return null;
    const framework = "react";
    const reference = references.find(
      (r) =>
        r.data.framework === framework && getReferenceSlug(r) === legacy.slug,
    );
    if (!reference) return null;
    const itemId = nextUrl.hash ? nextUrl.hash.replace(/^#/, "") : undefined;
    if (!itemId) return { reference };
    // Legacy hashes may omit the item kind prefix. Assume kind "prop".
    const item =
      getReferenceItem(reference.data, itemId) ||
      getReferenceItem(reference.data, getReferenceItemId("prop", itemId));
    if (!item) return null;
    return { reference, item };
  }
  const { framework, component, slug } = segments;
  const referenceId = `${framework}/${component}/${slug}`;
  const reference = references.find((r) => r.id === referenceId);
  if (!reference) return null;
  const itemId = nextUrl.hash ? nextUrl.hash.replace(/^#/, "") : undefined;
  if (!itemId) return { reference };
  const item = getReferenceItem(reference.data, itemId);
  if (!item) return null;
  return { reference, item };
}

/**
 * Returns true if the given URL has the shape of a reference page, regardless
 * of whether the reference actually exists. Pattern:
 * /{framework}/components/{component}/{slug}/[#item]
 */
export function isReferenceURLLike(
  url?: string | URL | null,
): url is string | URL {
  if (!url) return false;
  const nextUrl = new URL(url, DEFAULT_URL);
  const segments = getReferenceURLSegments(nextUrl);
  if (segments) {
    if (!isFramework(segments.framework)) return false;
    return true;
  }
  // Accept legacy shape: /reference/{slug}
  const legacy = getLegacyReferenceURLSegments(nextUrl);
  return Boolean(legacy);
}
