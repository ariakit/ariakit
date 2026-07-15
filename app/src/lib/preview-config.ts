/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { z } from "astro/zod";
import type {
  PreviewDiscoveryOptions,
  PreviewRootOptions,
} from "./preview-discovery.ts";

export const EXAMPLES_PREVIEW_KIND = "examples";
export const SANDBOX_PREVIEW_KIND = "sandbox";

export const PREVIEW_KINDS = [
  EXAMPLES_PREVIEW_KIND,
  SANDBOX_PREVIEW_KIND,
] as const;

export const PreviewKindSchema = z.enum(PREVIEW_KINDS);

export type PreviewKind = z.infer<typeof PreviewKindSchema>;

interface PreviewConfigRoot extends PreviewRootOptions {
  kind: PreviewKind;
}

interface PreviewConfig extends PreviewDiscoveryOptions {
  roots: PreviewConfigRoot[];
}

export const previewConfig = {
  roots: [
    {
      kind: EXAMPLES_PREVIEW_KIND,
      dir: "examples",
      metadataRequired: true,
    },
    {
      kind: SANDBOX_PREVIEW_KIND,
      dir: "sandbox",
      metadataRequired: false,
    },
  ],
} satisfies PreviewConfig;
