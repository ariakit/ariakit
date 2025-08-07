/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { clerkClient } from "@clerk/astro/server";
import type { APIContext } from "astro";
import { z } from "zod";
import { getFlagEmoji } from "#app/lib/locale.ts";

const paramsSchema = z.object({
  query: z.string().optional(),
  offset: z.coerce.number().nonnegative().default(0),
  limit: z.coerce.number().nonnegative().default(25),
});

type Params = z.infer<typeof paramsSchema>;

export async function getPaginationData(context: APIContext) {
  const session = await context.session?.get("admin");
  const schema = paramsSchema.extend({
    limit: paramsSchema.shape.limit.default(session?.limit ?? 25),
  });
  const { data, success } = schema.safeParse(
    Object.fromEntries(context.url.searchParams),
  );
  if (!success) {
    return context.redirect(context.url.pathname);
  }
  const { limit, offset, query } = data;
  if (limit !== session?.limit) {
    context.session?.set("admin", { limit });
  }
  return { limit, offset, query };
}

export function setURLParam(url: URL, key: keyof Params, value: unknown) {
  if (value === null) {
    url.searchParams.delete(key);
  } else if (value != null) {
    url.searchParams.set(key, value.toString());
  }
  return url;
}

type GetPaginationUrlOptions = {
  [K in keyof Params]?: Params[K] | null;
};

export function getPaginationUrl(
  context: APIContext,
  { query, limit, offset }: GetPaginationUrlOptions = {},
) {
  const url = new URL(context.url);
  setURLParam(url, "limit", limit);
  setURLParam(url, "offset", offset);
  setURLParam(url, "query", query);
  return url.toString();
}

export async function getClerkInstanceUrl(context: APIContext) {
  const clerk = clerkClient(context);
  const appId = import.meta.env.CLERK_APP_ID;
  const instance = await clerk.instance.get();
  return `https://dashboard.clerk.com/apps/${appId}/instances/${instance.id}`;
}

export function getStripeDashboardUrl() {
  return `https://dashboard.stripe.com`;
}

interface GetPageUrlsOptions {
  totalCount: number;
  limit: number;
  offset: number;
}

export function getPageUrls(context: APIContext, options: GetPageUrlsOptions) {
  const { totalCount, limit, offset } = options;
  const hasMore = totalCount > offset + limit;
  const previousUrl =
    (offset > 0
      ? getPaginationUrl(context, {
          limit,
          offset: Math.max(offset - limit, 0),
        })
      : null) ?? null;
  const nextUrl =
    (hasMore
      ? getPaginationUrl(context, { limit, offset: offset + limit })
      : null) ?? null;
  return { previousUrl, nextUrl };
}

export function processFormRequest(context: APIContext) {
  if (!context.url.searchParams.has("_action")) return;
  return context.redirect(context.originPathname, 303);
}

export function getCurrencyData() {
  const currencies = [
    { code: "USD", symbol: "$", name: "United States Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "GBP", symbol: "£", name: "British Pound Sterling" },
    { code: "CNY", symbol: "CN¥", name: "Chinese Yuan Renminbi" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble" },
    { code: "KRW", symbol: "₩", name: "South Korean Won" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
    { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    { code: "SAR", symbol: "SR", name: "Saudi Riyal" },
    { code: "ARS", symbol: "AR$", name: "Argentine Peso" },
  ];
  const countries = [
    { code: "US", name: "United States", flag: getFlagEmoji("US") },
    { code: "GB", name: "United Kingdom", flag: getFlagEmoji("GB") },
    { code: "CA", name: "Canada", flag: getFlagEmoji("CA") },
    { code: "AU", name: "Australia", flag: getFlagEmoji("AU") },
    { code: "DE", name: "Germany", flag: getFlagEmoji("DE") },
    { code: "FR", name: "France", flag: getFlagEmoji("FR") },
    { code: "JP", name: "Japan", flag: getFlagEmoji("JP") },
    { code: "CN", name: "China", flag: getFlagEmoji("CN") },
    { code: "IN", name: "India", flag: getFlagEmoji("IN") },
    { code: "BR", name: "Brazil", flag: getFlagEmoji("BR") },
    { code: "ZA", name: "South Africa", flag: getFlagEmoji("ZA") },
    { code: "RU", name: "Russia", flag: getFlagEmoji("RU") },
    { code: "MX", name: "Mexico", flag: getFlagEmoji("MX") },
    { code: "IT", name: "Italy", flag: getFlagEmoji("IT") },
    { code: "ES", name: "Spain", flag: getFlagEmoji("ES") },
    { code: "KR", name: "South Korea", flag: getFlagEmoji("KR") },
    { code: "ID", name: "Indonesia", flag: getFlagEmoji("ID") },
    { code: "TR", name: "Turkey", flag: getFlagEmoji("TR") },
    { code: "SA", name: "Saudi Arabia", flag: getFlagEmoji("SA") },
    { code: "AR", name: "Argentina", flag: getFlagEmoji("AR") },
  ];
  return { currencies, countries };
}
