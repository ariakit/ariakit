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

const PREVIEW_RELOAD_EVENT = "ariakit-preview-reload";

/**
 * Asks the inline examples of the preview with the given id to render again
 * from their initial state.
 */
export function reloadPreview(id: string) {
  document.dispatchEvent(
    new CustomEvent(PREVIEW_RELOAD_EVENT, { detail: { id } }),
  );
}

/**
 * Calls `callback` when a preview card reloads the preview with the given id.
 * Returns a function that unsubscribes.
 */
export function subscribePreviewReload(id: string, callback: () => void) {
  const onReload = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    if (event.detail?.id !== id) return;
    callback();
  };
  document.addEventListener(PREVIEW_RELOAD_EVENT, onReload);
  return () => document.removeEventListener(PREVIEW_RELOAD_EVENT, onReload);
}
