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
import { getReferenceItemIds, getReferenceSlug } from "./reference.ts";
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

export interface GetReferencePathParams {
  reference: CollectionEntry<"references">;
  item?: string;
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
  if (item && !getReferenceItemIds(reference).has(item)) return;
  const nextUrl = new URL(url ?? DEFAULT_URL);
  const slugPath = slug ? `/${slug}` : "";
  nextUrl.pathname = `/${framework}${COMPONENTS_PATH}/${component}${slugPath}/`;
  nextUrl.hash = item ? `#${item}` : "";
  return nextUrl;
}

export function getReferencePath({ reference, item }: GetReferencePathParams) {
  const url = getReferenceURL({ reference, item });
  return url?.toString().replace(url.origin, "");
}

export interface ParseReferenceURLResult {
  reference: CollectionEntry<"references">;
  item?: string;
}

export async function parseReferenceURL(
  url: string | URL,
  references: CollectionEntry<"references">[],
): Promise<ParseReferenceURLResult | null> {
  const nextUrl = new URL(url, DEFAULT_URL);
  const [, framework, collection, component, slug] =
    nextUrl.pathname.split("/");
  if (!framework) return null;
  if (!component) return null;
  if (!slug) return null;
  if (`/${collection}` !== COMPONENTS_PATH) return null;
  const item = nextUrl.hash ? nextUrl.hash.replace(/^#/, "") : undefined;
  const id = `${framework}/${component}/${slug}`;
  const reference = references.find((r) => r.id === id);
  if (!reference) return null;
  if (!item) return { reference };
  // If item provided, validate
  if (item && !getReferenceItemIds(reference).has(item)) {
    return null;
  }
  return { reference, item };
}

/**
 * Returns true if the given URL has the shape of a reference page, regardless
 * of whether the reference actually exists.
 * Pattern: /{framework}/components/{component}/{slug}/[#item]
 */
export function isReferenceURLLike(url: string | URL): boolean {
  try {
    const nextUrl = new URL(url, DEFAULT_URL);
    const segments = nextUrl.pathname.split("/").filter(Boolean);
    if (segments.length < 4) return false;
    const [framework, collection, component, slug] = segments;
    if (!slug) return false;
    if (!component) return false;
    if (!isFramework(framework)) return false;
    if (`/${collection}` !== COMPONENTS_PATH) return false;
    return true;
  } catch {
    return false;
  }
}
