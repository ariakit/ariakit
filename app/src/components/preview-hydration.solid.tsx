/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import type { Component } from "solid-js";
import {
  markPreviewHydrated,
  subscribePreviewReload,
} from "#app/lib/preview-hydration.ts";

export function withPreviewHydration(Preview: Component, id: string) {
  return function PreviewHydration() {
    const [reloadCount, setReloadCount] = createSignal(0);
    onMount(() => {
      markPreviewHydrated();
      const unsubscribe = subscribePreviewReload(id, () => {
        setReloadCount((count) => count + 1);
      });
      onCleanup(unsubscribe);
    });
    // Each reload creates the example again, which resets its state.
    const preview = createMemo(() => {
      reloadCount();
      return <Preview />;
    });
    return <>{preview()}</>;
  };
}
