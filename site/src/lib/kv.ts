import type { APIContext } from "astro";
import { getUnixTime } from "./datetime.ts";
import { nonNullable } from "./non-nullable.ts";
import type { PriceData, PromoData } from "./schemas.ts";

function priceKey(key = "") {
  return `price:${key}`;
}

function promoKey(key = "") {
  return `promo:${key}`;
}

export function getPlusStore(context: APIContext) {
  return context.locals.runtime.env.PLUS;
}

export function getEventsStore(context: APIContext) {
  return context.locals.runtime.env.EVENTS;
}

export function getAdminStore(context: APIContext) {
  return context.locals.runtime.env.ADMIN;
}

export async function getPrice(context: APIContext, key: string) {
  const store = getPlusStore(context);
  const price = await store.getWithMetadata<PriceData>(priceKey(key));
  return price.metadata;
}

export async function getPrices(context: APIContext, keys?: string[]) {
  const store = getPlusStore(context);
  if (!keys?.length) {
    const result = await store.list<PriceData>({ prefix: priceKey() });
    return result.keys.map((key) => key.metadata).filter(nonNullable);
  }
  const priceKeys = keys.map(priceKey);
  const prices = await store.getWithMetadata<PriceData>(priceKeys);
  return prices
    .values()
    .map((price) => price?.metadata)
    .filter(nonNullable)
    .toArray();
}

export async function putPrice(context: APIContext, data: PriceData) {
  const store = getPlusStore(context);
  await store.put(priceKey(data.key), data.amount.toString(), {
    metadata: data,
  });
}

export async function deletePrice(context: APIContext, key: string) {
  const store = getPlusStore(context);
  await store.delete(priceKey(key));
}

interface GetPromoParams {
  context: APIContext;
  product?: string | null;
  user?: string | null | "any";
}

export async function getAllPromos({ context, product, user }: GetPromoParams) {
  const store = getPlusStore(context);
  const result = await store.list<PromoData>({ prefix: promoKey() });
  const promos = result.keys.map((key) => key.metadata);
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
  return promos.reduce((best, promo) => {
    if (promo.percentOff > best.percentOff) return promo;
    return best;
  });
}

export async function putPromo(context: APIContext, data: PromoData) {
  const store = getPlusStore(context);
  await store.put(promoKey(data.id), data.percentOff.toString(), {
    metadata: data,
  });
}

export async function deletePromo(context: APIContext, id: string) {
  const store = getPlusStore(context);
  await store.delete(promoKey(id));
}

export async function processEvent(context: APIContext, id: string) {
  const store = getEventsStore(context);
  await store.put(id, "processed");
}

export async function isEventProcessed(context: APIContext, id: string) {
  const store = getEventsStore(context);
  const event = await store.get(id);
  return event !== null;
}

export async function syncAdmin(context: APIContext, time = getUnixTime()) {
  const store = getAdminStore(context);
  await store.put("last-sync", time.toString());
}

export async function getAdminLastSync(context: APIContext) {
  const store = getAdminStore(context);
  const lastSync = await store.get("last-sync");
  if (!lastSync) return;
  return Number.parseInt(lastSync);
}
