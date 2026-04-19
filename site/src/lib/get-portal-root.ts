/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export function getPortalRoot(node: HTMLElement) {
  const id = "portal-root";
  const existingRoot = document.getElementById(id);
  if (existingRoot) return existingRoot;
  const root = document.createElement("div");
  root.id = id;
  node.ownerDocument?.body.appendChild(root);
  return root;
}
