/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { PlusType } from "./schemas.ts";

export interface GetPlusPriceKeyParams {
  type?: PlusType;
  currency?: string;
  countryCode?: string;
}

export function getPlusPriceKey({
  type = "personal",
  currency = "USD",
  countryCode,
}: GetPlusPriceKeyParams) {
  const isPersonal = type === "personal";
  const lowercaseCurrency = currency.toLowerCase();
  const country = countryCode ? `-${countryCode.toLowerCase()}` : "";
  return isPersonal
    ? `ariakit-plus-${lowercaseCurrency}${country}`
    : `ariakit-plus-${type}-${lowercaseCurrency}${country}`;
}

export function parsePlusPriceKey(key: string) {
  const match = key.match(/ariakit-plus-(?:team-)?([a-z]+)(?:-([a-z]{2}))?$/);
  if (!match) return {};
  const [, currency, countryCode] = match;
  if (!currency) return {};
  return {
    type: key.includes("team-") ? ("team" as const) : ("personal" as const),
    currency,
    countryCode,
  };
}
