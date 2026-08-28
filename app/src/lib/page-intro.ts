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
