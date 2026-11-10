/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

/**
 * The categories of recipes with their labels. The site navigation lists the
 * categories in this order.
 */
export const recipeCategories = {
  layout: "Layout",
  navigation: "Navigation",
  forms: "Forms",
  overlays: "Overlays",
  content: "Content",
} as const;

export type RecipeCategory = keyof typeof recipeCategories;
