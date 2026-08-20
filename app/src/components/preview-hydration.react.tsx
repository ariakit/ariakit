/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { useEffect } from "react";
import type { ComponentType } from "react";
import { markPreviewHydrated } from "#app/lib/preview-hydration.ts";

export function withPreviewHydration(Preview: ComponentType) {
  return function PreviewHydration() {
    useEffect(markPreviewHydrated, []);
    return <Preview />;
  };
}
