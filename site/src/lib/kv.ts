import type { APIContext } from "astro";
import type { PriceData, PromoData } from "./schemas.ts";

type EventStatus = "processing" | "processed" | "failed";

export function getPlusStore(context: APIContext) {
  return context.locals.runtime.env.PLUS;
}

export function getEventsStore(context: APIContext) {
  return context.locals.runtime.env.EVENTS;
}

export async function getPrice(context: APIContext, key: string) {
  const store = getPlusStore(context);
  return store.get<PriceData>(`price:${key}`, "json");
}

export async function getPrices(context: APIContext, keys: string[]) {
  const store = getPlusStore(context);
  const prices = await store.get<PriceData>(
    keys.map((key) => `price:${key}`),
    "json",
  );
  return Array.from(prices.values()).filter((price) => price != null);
}

export async function putPrice(context: APIContext, data: PriceData) {
  const store = getPlusStore(context);
  await store.put(`price:${data.key}`, JSON.stringify(data));
}

export async function deletePrice(context: APIContext, key: string) {
  const store = getPlusStore(context);
  await store.delete(`price:${key}`);
}

interface GetPromoParams {
  context: APIContext;
  product?: string | null;
  user?: string | null;
}

export async function getAllPromos({ context, product, user }: GetPromoParams) {
  const store = getPlusStore(context);
  const result = await store.list({ prefix: "promo:" });
  const keys = result.keys.map((key) => key.name);
  const promos = await store.get<PromoData>(keys, "json");
  if (!promos) return [];
  return Array.from(promos.values()).filter((promo): promo is PromoData => {
    if (promo == null) return false;
    if (promo.user && promo.user !== user) return false;
    if (promo.products.length) {
      if (!product) return false;
      if (!promo.products.includes(product)) return false;
    }
    return true;
  });
}

export async function getBestPromo(params: GetPromoParams) {
  const promos = await getAllPromos(params);
  if (!promos) return null;
  return promos.reduce((best, promo) => {
    if (promo.percentOff > best.percentOff) return promo;
    return best;
  });
}

export async function putPromo(context: APIContext, data: PromoData) {
  const store = getPlusStore(context);
  await store.put(`promo:${data.id}`, JSON.stringify(data));
}

export async function deletePromo(context: APIContext, id: string) {
  const store = getPlusStore(context);
  await store.delete(`promo:${id}`);
}

export async function processEvent(
  context: APIContext,
  id: string,
  status: EventStatus,
) {
  const store = getEventsStore(context);
  if (status === "failed") {
    await store.delete(id);
  } else {
    await store.put(id, status);
  }
}

export async function isEventHandled(context: APIContext, id: string) {
  const store = getEventsStore(context);
  const status = await store.get<EventStatus>(id);
  return status === "processed" || status === "processing";
}
