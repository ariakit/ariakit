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

export const RECIPES_PREVIEW_KIND = "recipes";
export const COMPONENTS_PREVIEW_KIND = "components";
export const SANDBOX_PREVIEW_KIND = "sandbox";

export const PREVIEW_KINDS = [
  RECIPES_PREVIEW_KIND,
  COMPONENTS_PREVIEW_KIND,
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
      kind: RECIPES_PREVIEW_KIND,
      dir: "recipes",
      metadataRequired: true,
      // Descriptions are meant for AI agents that choose between examples.
      descriptionRequired: true,
    },
    {
      kind: COMPONENTS_PREVIEW_KIND,
      dir: "component-docs",
      metadataRequired: true,
      // Component pages and recipes can share a slug, such as skeleton.
      idPrefix: "components",
    },
    {
      kind: SANDBOX_PREVIEW_KIND,
      dir: "sandbox",
      metadataRequired: false,
    },
  ],
} satisfies PreviewConfig;

/** Returns the segment that starts the preview ids of a kind, if any. */
export function getPreviewIdPrefix(kind: PreviewKind) {
  const roots: PreviewConfigRoot[] = previewConfig.roots;
  return roots.find((root) => root.kind === kind)?.idPrefix;
}
