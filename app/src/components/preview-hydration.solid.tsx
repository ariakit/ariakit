/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { onMount } from "solid-js";
import type { Component } from "solid-js";
import { markPreviewHydrated } from "#app/lib/preview-hydration.ts";

export function withPreviewHydration(Preview: Component) {
  return function PreviewHydration() {
    onMount(markPreviewHydrated);
    return <Preview />;
  };
}
