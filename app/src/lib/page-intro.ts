/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { button } from "@ariakit/ui/styles/button.ts";

/**
 * Descendant rules for the page intro/description blocks shared by the
 * component and example pages. Legacy ak-prose-elements styled descendants
 * without the prose root's flex/gap/text wrapper. The Prose component would
 * add that wrapper, introducing gaps between paragraphs and a competing font
 * size, so the description keeps a plain div and copies the descendant rules
 * it needs from @ariakit/ui/styles/prose.ts (keep in sync): strong emphasis
 * and inline code chips. Paragraphs and links are styled by the content-*
 * MDX components plus the ink overrides at the call sites.
 */
export const proseElements = [
  "[&_:where(strong)]:ak-ink-100 [&_:where(strong)]:font-medium",
  "[&_:where(code):not(:where(pre_code))]:ak-layer",
  "[&_:where(code):not(:where(pre_code))]:ak-layer-6",
  "[&_:where(code):not(:where(pre_code))]:ak-edge-15",
  "[&_:where(code):not(:where(pre_code))]:ring",
  "[&_:where(code):not(:where(pre_code))]:rounded",
  "[&_:where(code):not(:where(pre_code))]:px-[0.25em]",
  "[&_:where(code):not(:where(pre_code))]:py-[0.18em]",
  "[&_:where(code):not(:where(pre_code))]:font-mono",
  "[&_:where(code):not(:where(pre_code))]:text-inherit",
  "[&_:where(code):not(:where(pre_code))]:[font-size-adjust:0.48]",
];

/**
 * Tag chip attributes shared by the component and example page intros.
 * Legacy composed ak-badge with ak-button: the badge geometry moves to the
 * button style through the control variants that @ariakit/ui/styles/badge.ts
 * sets as defaults.
 */
export const tagChip = button.html({
  $rounded: "full",
  $size: "xs",
  $p: 1,
  $px: "lg",
  $lightnessOffset: false,
  class: "ak-layer-6",
});
