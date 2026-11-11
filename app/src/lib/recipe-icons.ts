/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { LucideIcon } from "lucide-react";
import {
  ChevronsRight,
  CircleDot,
  CodeXml,
  Compass,
  Copy,
  Ellipsis,
  FolderClosed,
  GalleryHorizontal,
  ListFilter,
  MessageSquareText,
  PanelsTopLeft,
  SquareCheck,
  SquareDashed,
  TableOfContents,
  TextCursorInput,
} from "lucide-react";

/**
 * The icons that a recipe can set in its frontmatter `icon`, by their Lucide
 * name. The site navigation shows the icon before the recipe link label.
 */
export const recipeIcons = {
  "chevrons-right": ChevronsRight,
  "circle-dot": CircleDot,
  "code-xml": CodeXml,
  compass: Compass,
  copy: Copy,
  ellipsis: Ellipsis,
  "folder-closed": FolderClosed,
  "gallery-horizontal": GalleryHorizontal,
  "list-filter": ListFilter,
  "message-square-text": MessageSquareText,
  "panels-top-left": PanelsTopLeft,
  "square-check": SquareCheck,
  "square-dashed": SquareDashed,
  "table-of-contents": TableOfContents,
  "text-cursor-input": TextCursorInput,
} satisfies Record<string, LucideIcon>;

export type RecipeIcon = keyof typeof recipeIcons;
