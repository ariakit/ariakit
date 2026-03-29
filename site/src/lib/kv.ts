/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getUnixTime } from "./datetime.ts";
import { nonNullable } from "./object.ts";
import type { PriceData, PromoData } from "./schemas.ts";

export type CloudflareEnv = Pick<Cloudflare.Env, "PLUS" | "EVENTS" | "ADMIN">;

function priceKey(key = "") {
  return `price:${key}`;
}

function promoKey(key = "") {
  return `promo:${key}`;
}

export function getPlusStore(env: CloudflareEnv) {
  return env.PLUS;
}

export function getEventsStore(env: CloudflareEnv) {
  return env.EVENTS;
}

export function getAdminStore(env: CloudflareEnv) {
  return env.ADMIN;
}

export async function getPrice(env: CloudflareEnv, key: string) {
  const store = getPlusStore(env);
  const price = await store.getWithMetadata<PriceData>(priceKey(key));
  return price.metadata;
}

export async function getPrices(
  env: CloudflareEnv,
  keys?: string[],
): Promise<PriceData[]> {
  const store = getPlusStore(env);
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

export async function putPrice(env: CloudflareEnv, data: PriceData) {
  const store = getPlusStore(env);
  await store.put(priceKey(data.key), data.amount.toString(), {
    metadata: data,
  });
}

export async function deletePrice(env: CloudflareEnv, key: string) {
  const store = getPlusStore(env);
  await store.delete(priceKey(key));
}

interface GetPromoParams {
  env: CloudflareEnv;
  product?: string | null;
  user?: string | null;
}

export async function getAllPromos({
  env,
  product,
  user,
}: GetPromoParams): Promise<PromoData[]> {
  const store = getPlusStore(env);
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
    // The Stripe webhook doesn't automatically send an event when a promo code
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

export async function putPromo(env: CloudflareEnv, data: PromoData) {
  const store = getPlusStore(env);
  await store.put(promoKey(data.id), data.percentOff.toString(), {
    metadata: data,
  });
}

export async function deletePromo(env: CloudflareEnv, id: string) {
  const store = getPlusStore(env);
  await store.delete(promoKey(id));
}

export async function processEvent(env: CloudflareEnv, id: string) {
  const store = getEventsStore(env);
  await store.put(id, "processed");
}

export async function isEventProcessed(env: CloudflareEnv, id: string) {
  const store = getEventsStore(env);
  const event = await store.get(id);
  return event !== null;
}

export async function syncAdmin(env: CloudflareEnv, time = getUnixTime()) {
  const store = getAdminStore(env);
  await store.put("last-sync", time.toString());
}

export async function getAdminLastSync(env: CloudflareEnv) {
  const store = getAdminStore(env);
  const lastSync = await store.get("last-sync");
  if (!lastSync) return;
  return Number.parseInt(lastSync, 10);
}
