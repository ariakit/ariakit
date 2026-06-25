/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { APIContext } from "astro";
import { ActionError, defineAction } from "astro:actions";
import type { Stripe } from "stripe";
import { z } from "zod";
import { getUser, isAdmin } from "#app/lib/auth.ts";
import {
  deletePrice,
  deletePromo,
  getAllPromos,
  getPrices,
  putPrice,
  putPromo,
  syncAdmin,
} from "#app/lib/kv.ts";
import { formatCurrency } from "#app/lib/locale.ts";
import { createLogger } from "#app/lib/logger.ts";
import { objectId } from "#app/lib/object.ts";
import type { PlusType, PriceData } from "#app/lib/schemas.ts";
import { PlusTypeSchema } from "#app/lib/schemas.ts";
import {
  createSalePromo,
  expanded,
  getPlusPriceKey,
  getPromotionCoupon,
  getStripeClient,
  isSalePromo,
  parsePlusPriceKey,
} from "#app/lib/stripe.ts";
import { wrapActionContext } from "#app/lib/wrap-action-context.ts";
import { getCachedPriceDeletionReason } from "./admin-price-cache.ts";

const logger = createLogger("admin");

interface DefaultProduct {
  name: string;
  type: PlusType;
  prices: Array<{ key: string; amount: number }>;
}

const defaultProducts: DefaultProduct[] = [
  {
    name: "Ariakit Plus",
    type: "personal",
    prices: [
      { key: "ariakit-plus-usd", amount: 29700 },
      { key: "ariakit-plus-gbp", amount: 21700 },
      { key: "ariakit-plus-eur", amount: 23700 },
      { key: "ariakit-plus-inr", amount: 970000 },
    ],
  },
  {
    name: "Ariakit Plus Team",
    type: "team",
    prices: [
      { key: "ariakit-plus-team-usd", amount: 87900 },
      { key: "ariakit-plus-team-gbp", amount: 63900 },
      { key: "ariakit-plus-team-eur", amount: 69900 },
      { key: "ariakit-plus-team-inr", amount: 2890000 },
    ],
  },
];

async function syncPrices() {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new ActionError({ code: "INTERNAL_SERVER_ERROR" });
  }
  logger.info("Syncing prices and products...");

  const prices: Stripe.Price[] = [];
  const pricesToCache = new Map<string, PriceData>();
  const updatedProductIds = new Set<string>();

  // Get existing prices
  for await (const price of stripe.prices.list({
    active: true,
    type: "one_time",
    expand: ["data.product"],
    limit: 100,
  })) {
    prices.push(price);
  }

  // Check if existing price products have the correct metadata
  for (const price of prices) {
    expanded(price.product);
    if (price.product.deleted) continue;
    const priceKey = price.lookup_key;
    if (!priceKey) {
      logger.warn("Price %s has no lookup key. Skipping...", price.id);
      continue;
    }
    const { type } = parsePlusPriceKey(priceKey);
    const { success, data: priceType } = PlusTypeSchema.safeParse(type);
    if (!success) {
      logger.warn(
        "Price %s has invalid key %s. Skipping...",
        price.id,
        priceKey,
      );
      continue;
    }
    pricesToCache.set(priceKey, {
      id: price.id,
      type: priceType,
      key: priceKey,
      product: price.product.id,
      currency: price.currency,
      amount: price.unit_amount || 0,
      taxBehavior: price.tax_behavior || "exclusive",
    });
    const productType = price.product.metadata.plusType;
    if (productType !== priceType) {
      if (updatedProductIds.has(price.product.id)) {
        logger.info(
          "Product %s already updated. Skipping...",
          price.product.id,
        );
        continue;
      }
      logger.warn(
        "Product %s has invalid plus type %s, expected %s. Updating...",
        price.product.id,
        productType,
        priceType,
      );
      const product = await stripe.products.update(price.product.id, {
        metadata: { plusType: priceType },
      });
      updatedProductIds.add(price.product.id);
      logger.info("Updated product %s", product.id);
    }
  }

  // Get existing products
  const products = await stripe.products.list({ active: true, limit: 100 });

  // Create the missing products and sync prices with KV store
  for (const defaultProduct of defaultProducts) {
    let product = products.data.find(
      (product) => product.metadata.plusType === defaultProduct.type,
    );
    if (!product) {
      logger.warn("Product %s not found. Creating...", defaultProduct.type);
      product = await stripe.products.create({
        name: defaultProduct.name,
        metadata: { plusType: defaultProduct.type },
      });
      logger.info("Created product %s (%s)", product.name, product.id);
    }

    for (const defaultPrice of defaultProduct.prices) {
      const { currency } = parsePlusPriceKey(defaultPrice.key);
      if (!currency) {
        logger.error("Currency not found for price", defaultPrice.key);
        continue;
      }
      let price = prices.find((price) => price.lookup_key === defaultPrice.key);
      if (!price) {
        logger.warn("Price %s not found. Creating...", defaultPrice.key);
        price = await stripe.prices.create({
          currency,
          product: product.id,
          lookup_key: defaultPrice.key,
          unit_amount: defaultPrice.amount,
          tax_behavior: "exclusive",
          transfer_lookup_key: true,
          expand: ["product"],
        });
        logger.info("Created price %s (%s)", price.lookup_key, price.id);
      }
      const type = PlusTypeSchema.parse(
        parsePlusPriceKey(defaultPrice.key).type,
      );
      expanded(price.product);
      pricesToCache.set(defaultPrice.key, {
        id: price.id,
        type,
        key: defaultPrice.key,
        product: price.product.id,
        currency: price.currency,
        amount: price.unit_amount || defaultPrice.amount,
        taxBehavior: price.tax_behavior || "exclusive",
      });
    }
  }

  for (const price of pricesToCache.values()) {
    await putPrice(price);
    logger.info("Cached price %s (%s)", price.key, price.id);
  }

  const cachedPrices = await getPrices();

  // Delete prices that are not active
  for (const price of cachedPrices) {
    const deletionReason = getCachedPriceDeletionReason({
      price,
      activePrices: prices,
      syncedPrices: pricesToCache,
    });
    if (!deletionReason) continue;
    if (deletionReason === "invalid-key") {
      logger.warn(
        "Price %s has invalid key. Deleting from cache...",
        price.key,
      );
      await deletePrice(price.key);
      continue;
    }
    logger.warn("Price %s is not active. Deleting from cache...", price.key);
    await deletePrice(price.key);
  }
}

async function syncPromos(context: APIContext) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new ActionError({ code: "INTERNAL_SERVER_ERROR" });
  }
  logger.info("Syncing promos...");

  const promos: Stripe.PromotionCode[] = [];
  const cachedPromos = await getAllPromos({ user: "any" });

  for await (const promo of stripe.promotionCodes.list({
    active: true,
    limit: 100,
    expand: ["data.customer", "data.promotion.coupon"],
  })) {
    const coupon = getPromotionCoupon(promo);
    if (!coupon) {
      logger.warn("Promo %s has no expanded coupon", promo.id);
      continue;
    }
    if (!promo.active) continue;
    if (coupon.deleted) continue;
    if (!coupon.valid) continue;
    if (!isSalePromo(coupon) && !promo.customer) {
      logger.warn("Promo %s is not a plus sale", promo.id);
      await deletePromo(promo.id);
      continue;
    }
    if (!coupon.percent_off) {
      logger.warn("Promo %s has no percent off", promo.id);
      await deletePromo(promo.id);
      continue;
    }
    let user: User | null = null;
    if (promo.customer) {
      const customer = promo.customer;
      expanded(customer);
      if (customer.deleted) {
        logger.warn("Promo %s has deleted customer %s", promo.id, customer.id);
        await deletePromo(promo.id);
        continue;
      }
      const { clerkId } = customer.metadata;
      if (!clerkId) {
        logger.warn(
          "Promo %s has customer %s with no clerk id",
          promo.id,
          customer.id,
        );
        await deletePromo(promo.id);
        continue;
      }
      user = await getUser({ context, user: clerkId });
      if (!user) {
        logger.warn(
          "Promo %s has customer %s with clerk id %s but no user",
          promo.id,
          customer.id,
          clerkId,
        );
        await deletePromo(promo.id);
        continue;
      }
    }
    const products = coupon.applies_to?.products ?? [];
    promos.push(promo);
    await putPromo({
      id: promo.id,
      type: user ? "customer" : "sale",
      user: user ? objectId(user) : null,
      products,
      expiresAt: promo.expires_at ?? coupon.redeem_by,
      percentOff: coupon.percent_off,
      timesRedeemed: promo.times_redeemed,
      maxRedemptions: promo.max_redemptions,
    });
    logger.info("Synced promo %s", promo.id);
  }

  // Delete promos that are not active
  for (const promo of cachedPromos) {
    const stripePromo = promos.find((p) => p.id === promo.id);
    if (stripePromo?.active) continue;
    logger.warn("Promo %s is not active. Deleting from cache...", promo.id);
    await deletePromo(promo.id);
  }
}

const SetPriceInputSchema = z.object({
  type: PlusTypeSchema,
  currency: z.string().regex(/^[a-z]{3}$/i),
  countryCode: z
    .string()
    .regex(/^$|^[a-z]{2}$/i)
    .optional(),
  amount: z.number(),
});

type SetPriceInput = z.infer<typeof SetPriceInputSchema>;

async function setPrice(input: SetPriceInput) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new ActionError({ code: "INTERNAL_SERVER_ERROR" });
  }
  const { type, currency, countryCode } = input;
  const key = getPlusPriceKey({ type, currency, countryCode });
  const amountWithCents = input.amount * 100;
  const formattedAmount = formatCurrency({ amount: input.amount, currency });
  const taxBehavior = "exclusive";
  const cachePrice = async (price: Stripe.Price) => {
    await putPrice({
      id: price.id,
      type,
      key,
      product: objectId(price.product),
      amount: price.unit_amount ?? amountWithCents,
      currency: price.currency,
      taxBehavior: price.tax_behavior || taxBehavior,
    });
  };
  const deactivatePrice = async (priceId: string) => {
    try {
      await stripe.prices.update(priceId, { active: false });
    } catch (error) {
      logger.error(
        "Error deactivating replaced price %s (%s)",
        key,
        priceId,
        error,
      );
      throw error;
    }
  };
  const getReplacedPrice = (price: Stripe.Price) => {
    const replacedPrice = price.metadata.replacedPrice;
    if (!replacedPrice) return null;
    if (replacedPrice === price.id) return null;
    return replacedPrice;
  };
  const deactivateReplacedPrice = async (
    priceId: string | null,
    expectedProduct: string,
    expectedCurrency: string,
  ) => {
    if (!priceId) return;
    const price = await stripe.prices.retrieve(priceId);
    const product = objectId(price.product);
    if (product !== expectedProduct) {
      logger.error(
        "Skipping replaced price for %s (%s): expected product %s, got %s",
        key,
        priceId,
        expectedProduct,
        product,
      );
      return;
    }
    if (price.currency !== expectedCurrency) {
      logger.error(
        "Skipping replaced price for %s (%s): expected currency %s, got %s",
        key,
        priceId,
        expectedCurrency,
        price.currency,
      );
      return;
    }
    if (price.lookup_key && price.lookup_key !== key) {
      logger.error(
        "Skipping replaced price for %s (%s): expected lookup key %s, got %s",
        key,
        priceId,
        key,
        price.lookup_key,
      );
      return;
    }
    if (price.active) {
      await deactivatePrice(price.id);
    }
  };
  const {
    data: [price],
  } = await stripe.prices.list({ limit: 1, lookup_keys: [key] });
  if (price) {
    const replacedPrice = getReplacedPrice(price);
    if (price.active) {
      await cachePrice(price);
      await deactivateReplacedPrice(
        replacedPrice,
        objectId(price.product),
        price.currency,
      );
    }
    if (price.active && price.unit_amount === amountWithCents) {
      logger.info("Price %s is already set to %s", key, formattedAmount);
      return;
    }
    logger.info(
      "Updating existing price %s (%s) from %s to %s",
      key,
      price.id,
      formatCurrency({
        amount: (price.unit_amount ?? 0) / 100,
        currency: price.currency,
      }),
      formattedAmount,
    );
  } else {
    logger.info("Creating new price %s at %s", key, formattedAmount);
  }

  let product = price?.product ? objectId(price.product) : null;

  if (!product) {
    const products = await stripe.products.list({ active: true, limit: 100 });
    product =
      products.data.find((p) => p.metadata.plusType === type)?.id || null;
    if (!product) {
      logger.error("No product found for plus type %s", type);
      throw new ActionError({ code: "BAD_REQUEST" });
    }
  }

  // Create the replacement first so a failure leaves the old price active.
  let newPrice: Stripe.Price;
  const createParams: Stripe.PriceCreateParams = {
    currency,
    product,
    lookup_key: key,
    unit_amount: amountWithCents,
    tax_behavior: taxBehavior,
    transfer_lookup_key: true,
  };
  if (price) {
    createParams.metadata = {
      replacedPrice: price.active
        ? price.id
        : getReplacedPrice(price) || price.id,
    };
  }
  try {
    newPrice = await stripe.prices.create(createParams);
  } catch (error) {
    logger.error("Error creating price %s at %s", key, formattedAmount, error);
    throw error;
  }
  await cachePrice(newPrice);
  if (price) {
    if (!price.active) {
      await deactivateReplacedPrice(
        getReplacedPrice(price),
        objectId(newPrice.product),
        newPrice.currency,
      );
    } else {
      await deactivatePrice(price.id);
    }
  }
  logger.info("Set price %s to %s", key, formattedAmount);
}

export const admin = {
  sync: defineAction({
    accept: "form",
    async handler(_, action) {
      const context = wrapActionContext(action);
      if (!(await isAdmin(context))) {
        throw new ActionError({ code: "UNAUTHORIZED" });
      }
      try {
        await syncPrices();
        await syncPromos(context);
        await syncAdmin();
      } catch (error) {
        logger.error("Error syncing admin data", error);
      }
    },
  }),

  setPrice: defineAction({
    accept: "form",
    input: SetPriceInputSchema,
    async handler(input, action) {
      const context = wrapActionContext(action);
      if (!(await isAdmin(context))) {
        throw new ActionError({ code: "UNAUTHORIZED" });
      }
      await setPrice(input);
    },
  }),

  setPromo: defineAction({
    accept: "form",
    input: z.object({
      percentOff: z.number().min(1).max(100),
      expiresInDays: z.number().optional(),
      maxRedemptions: z.number().optional(),
      user: z.string().optional(),
    }),
    async handler(input, action) {
      const context = wrapActionContext(action);
      if (!(await isAdmin(context))) {
        throw new ActionError({ code: "UNAUTHORIZED" });
      }
      const stripe = getStripeClient();
      if (!stripe) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR" });
      }
      const { percentOff, maxRedemptions, expiresInDays, user } = input;
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;
      await createSalePromo({
        context,
        user,
        percentOff,
        maxRedemptions,
        expiresAt,
      });
    },
  }),
};
