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

interface PreviewHydrationProps {
  /**
   * Renders nothing on the server and mounts the example after hydration, so
   * the page has no markup of the example to parse and hydrate.
   */
  isolated?: boolean;
}

/**
 * Wraps an example for its preview island. Other props, such as the result of
 * the `load` function of its server file, go to the example.
 */
export function withPreviewHydration<P extends object>(
  Preview: ComponentType<P>,
  id: string,
) {
  return function PreviewHydration({
    isolated,
    ...props
  }: PreviewHydrationProps & P) {
    const [reloadCount, setReloadCount] = useState(0);
    const [mounted, setMounted] = useState(!isolated);
    useEffect(() => {
      if (!mounted) {
        setMounted(true);
        return;
      }
      markPreviewHydrated();
    }, [mounted]);
    useEffect(() => {
      return subscribePreviewReload(id, () => {
        setReloadCount((count) => count + 1);
      });
    }, []);
    // Astro only accepts a component as React if it returns an element.
    if (!mounted) {
      return <></>;
    }
    // A new key mounts the example again, which resets its state. The rest of
    // the props is P without isolated, which TypeScript can't prove for a
    // generic P.
    return <Preview key={reloadCount} {...(props as P)} />;
  };
}
