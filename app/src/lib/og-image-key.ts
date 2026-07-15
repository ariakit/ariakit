/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Framework } from "./schemas.ts";

export interface GetOGImageItemKeyParams {
  id?: string;
  type?: "pages" | "examples" | "components" | "styles";
  framework?: Framework;
}

export function getOGImageItemKey({
  type = "pages",
  framework,
  id,
}: GetOGImageItemKeyParams) {
  // Preserve strict equality semantics between missing and empty values.
  return JSON.stringify({ type, framework, id });
}
