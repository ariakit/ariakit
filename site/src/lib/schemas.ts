import { z } from "zod";

export const FRAMEWORKS = [
  "react",
  "solid",
  "svelte",
  "vue",
  "preact",
] as const;
export const FrameworkSchema = z.enum(FRAMEWORKS);
export type Framework = z.infer<typeof FrameworkSchema>;

export const PLUS_CHECKOUT_STEPS = [
  "sign-in",
  "sign-up",
  "payment",
  "team",
  "success",
] as const;
export const PlusCheckoutStepSchema = z.enum(PLUS_CHECKOUT_STEPS);
export type PlusCheckoutStep = z.infer<typeof PlusCheckoutStepSchema>;

export const PLUS_TYPES = ["personal", "team"] as const;
export const PlusTypeSchema = z.enum(PLUS_TYPES);
export type PlusType = z.infer<typeof PlusTypeSchema>;

export const PriceDataSchema = z.object({
  id: z.string(),
  type: PlusTypeSchema,
  key: z.string(),
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
