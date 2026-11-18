/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ReactNode } from "react";

export interface MeasureOverlayProps {
  /** The name of the measurement, which tests find the drawing by. */
  label: string;
  children?: ReactNode;
}

/**
 * The drawing of a measurement part. It covers the stage of the figure, and the
 * legend of the figure shows its value.
 */
export function MeasureOverlay({ label, children }: MeasureOverlayProps) {
  return (
    <svg
      aria-hidden
      data-measure={label}
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      {children}
    </svg>
  );
}
