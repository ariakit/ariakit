/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { PreviewDiscoveryOptions } from "./preview-discovery.ts";

export const previewConfig = {
  roots: [
    {
      kind: "examples",
      dir: "examples",
      metadataRequired: true,
    },
    {
      kind: "sandbox",
      dir: "sandbox",
      metadataRequired: false,
    },
  ],
} satisfies PreviewDiscoveryOptions;
