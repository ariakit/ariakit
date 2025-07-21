/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import camelCase from "lodash-es/camelCase.js";
import mapKeys from "lodash-es/mapKeys.js";
import { z } from "zod";
import { frameworks } from "./frameworks.ts";
import { keys } from "./object.ts";
import { parsePlusPriceKey } from "./stripe.ts";
import { tags } from "./tags.ts";

export const FRAMEWORKS = keys(frameworks);
export const FrameworkSchema = z.enum(FRAMEWORKS);
export type Framework = z.infer<typeof FrameworkSchema>;

export const ADMONITION_TYPES = ["note", "tip", "warning", "caution"] as const;
export const AdmonitionTypeSchema = z.enum(ADMONITION_TYPES).catch("note");
export type AdmonitionType = z.infer<typeof AdmonitionTypeSchema>;

export const TAGS = keys(tags);
export const TagSchema = z.enum(TAGS);
export type Tag = z.infer<typeof TagSchema>;

export const PLUS_CHECKOUT_STEPS = ["login", "payment", "access"] as const;
export const PlusCheckoutStepSchema = z.enum(PLUS_CHECKOUT_STEPS);
export type PlusCheckoutStep = z.infer<typeof PlusCheckoutStepSchema>;

export const PLUS_ACCOUNT_PATHS = ["login", "", "team", "billing"] as const;
export const PlusAccountPathSchema = z.enum(PLUS_ACCOUNT_PATHS);
export type PlusAccountPath = z.infer<typeof PlusAccountPathSchema>;

export const PLUS_TYPES = ["personal", "team"] as const;
export const PlusTypeSchema = z.enum(PLUS_TYPES);
export type PlusType = z.infer<typeof PlusTypeSchema>;

export const PriceKeySchema = z.string().refine((key) => {
  const { type, currency } = parsePlusPriceKey(key);
  return !!type || !!currency;
});

export const PriceDataSchema = z.object({
  id: z.string(),
  type: PlusTypeSchema,
  key: PriceKeySchema,
  product: z.string(),
  amount: z.number(),
  currency: z.string(),
  taxBehavior: z.enum(["exclusive", "inclusive", "unspecified"]),
});
export type PriceData = z.infer<typeof PriceDataSchema>;

export const PromoDataSchema = z.object({
  id: z.string(),
  type: z.enum(["sale", "customer"]),
  user: z.string().nullable(),
  products: z.array(z.string()),
  expiresAt: z.number().nullable(),
  percentOff: z.number(),
  timesRedeemed: z.number(),
  maxRedemptions: z.number().nullable(),
});
export type PromoData = z.infer<typeof PromoDataSchema>;

export const URLSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return decodeURIComponent(value);
  });

export function camelCaseObject<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams,
) {
  return z
    .record(z.string())
    .transform((data) => mapKeys(data, (_, key) => camelCase(key)))
    .pipe(z.object(shape, params));
}
