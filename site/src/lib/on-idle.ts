/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export function onIdle(callback: () => void, timeout = 1) {
  if (typeof requestIdleCallback !== "undefined") {
    const handle = requestIdleCallback(callback, { timeout });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, Math.min(timeout, 1000));
  return () => clearTimeout(handle);
}
