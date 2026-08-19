/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export const PREVIEW_HYDRATED_ATTRIBUTE = "data-preview-hydrated";

export function markPreviewHydrated() {
  document.documentElement.setAttribute(PREVIEW_HYDRATED_ATTRIBUTE, "");
}
