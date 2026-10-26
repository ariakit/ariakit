/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  markPreviewHydrated,
  subscribePreviewReload,
} from "#app/lib/preview-hydration.ts";

export function withPreviewHydration(Preview: ComponentType, id: string) {
  return function PreviewHydration() {
    const [reloadCount, setReloadCount] = useState(0);
    useEffect(markPreviewHydrated, []);
    useEffect(() => {
      return subscribePreviewReload(id, () => {
        setReloadCount((count) => count + 1);
      });
    }, []);
    // A new key mounts the example again, which resets its state.
    return <Preview key={reloadCount} />;
  };
}
