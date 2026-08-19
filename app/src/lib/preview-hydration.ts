/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export function isPreviewHydrated() {
  if (!document.querySelector("astro-island")) return true;
  return document.documentElement.dataset.previewHydrated != null;
}

export function markPreviewHydrated() {
  document.documentElement.dataset.previewHydrated = "";
}
