/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { env } from "cloudflare:workers";
import { getUnixTime } from "./datetime.ts";
import { nonNullable } from "./object.ts";
import type { PriceData, PromoData } from "./schemas.ts";

type StoreName = "PLUS" | "EVENTS" | "ADMIN";

function priceKey(key = "") {
  return `price:${key}`;
}

function promoKey(key = "") {
  return `promo:${key}`;
}

function getStore(name: StoreName) {
  const store = env[name];
  if (!store) {
    throw new Error(`Missing Cloudflare ${name} binding`);
  }
  return store;
}

export function getPlusStore() {
  return getStore("PLUS");
}

export function getEventsStore() {
  return getStore("EVENTS");
}

export function getAdminStore() {
  return getStore("ADMIN");
}

export async function getPrice(key: string) {
  const store = getPlusStore();
  const price = await store.getWithMetadata<PriceData>(priceKey(key));
  return price.metadata;
}

export async function getPrices(keys?: string[]): Promise<PriceData[]> {
  const store = getPlusStore();
  if (!keys?.length) {
    const result = await store.list<PriceData>({ prefix: priceKey() });
    return result.keys
      .map((key: { metadata?: PriceData | undefined }) => key.metadata)
      .filter(nonNullable);
  }
  const priceKeys = keys.map(priceKey);
  const prices = await store.getWithMetadata<PriceData>(priceKeys);
  return prices
    .values()
    .map((price: { metadata: PriceData | null } | null) => price?.metadata)
    .filter(nonNullable)
    .toArray();
}

export async function putPrice(data: PriceData) {
  const store = getPlusStore();
  await store.put(priceKey(data.key), data.amount.toString(), {
    metadata: data,
  });
}

export async function deletePrice(key: string) {
  const store = getPlusStore();
  await store.delete(priceKey(key));
}

interface GetPromoParams {
  product?: string | null;
  user?: string | null;
}

export async function getAllPromos({
  product,
  user,
}: GetPromoParams): Promise<PromoData[]> {
  const store = getPlusStore();
  const result = await store.list<PromoData>({ prefix: promoKey() });
  const promos: (PromoData | undefined)[] = result.keys.map(
    (key: { metadata?: PromoData | undefined }) => key.metadata,
  );
  return promos.filter((promo): promo is PromoData => {
    if (promo == null) return false;
    if (user !== "any" && promo.user && promo.user !== user) return false;
    if (promo.products.length) {
      if (!product) return false;
      if (!promo.products.includes(product)) return false;
    }
    return true;
  });
}

export async function getBestPromo(
  promos: PromoData[],
): Promise<PromoData | null>;
export async function getBestPromo(
  params: GetPromoParams,
): Promise<PromoData | null>;

export async function getBestPromo(
  promosOrParams: GetPromoParams | PromoData[],
) {
  const promos = Array.isArray(promosOrParams)
    ? promosOrParams
    : await getAllPromos(promosOrParams);
  if (!promos.length) return null;
  const now = getUnixTime();
  const isValid = (promo: PromoData) => {
    // The Stripe webhook doesn’t automatically send an event when a promo code
    // expires, so we need to check manually
    if (promo.expiresAt && promo.expiresAt < now) return false;
    return true;
  };
  const validPromos = promos.filter(isValid);
  if (!validPromos.length) return null;
  return validPromos.reduce((best, promo) => {
    if (promo.percentOff > best.percentOff) return promo;
    return best;
  });
}

export async function putPromo(data: PromoData) {
  const store = getPlusStore();
  await store.put(promoKey(data.id), data.percentOff.toString(), {
    metadata: data,
  });
}

export async function deletePromo(id: string) {
  const store = getPlusStore();
  await store.delete(promoKey(id));
}

export async function processEvent(id: string) {
  const store = getEventsStore();
  await store.put(id, "processed");
}

export async function isEventProcessed(id: string) {
  const store = getEventsStore();
  const event = await store.get(id);
  return event !== null;
}

export async function syncAdmin(time = getUnixTime()) {
  const store = getAdminStore();
  await store.put("last-sync", time.toString());
}

export async function getAdminLastSync() {
  const store = getAdminStore();
  const lastSync = await store.get("last-sync");
  if (!lastSync) return;
  return Number.parseInt(lastSync, 10);
}
