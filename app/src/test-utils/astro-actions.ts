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

export function getActionContext(_context: APIContext) {
  throw new Error("Mock astro:actions before using getActionContext in tests.");
}
