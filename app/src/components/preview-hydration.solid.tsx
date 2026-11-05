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

/**
 * Wraps an example for its preview island. Its props, such as the result of the
 * `load` function of its server file, go to the example.
 */
export function withPreviewHydration<P extends object>(
  Preview: Component<P>,
  id: string,
) {
  return function PreviewHydration(props: P) {
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
      return <Preview {...props} />;
    });
    return <>{preview()}</>;
  };
}
