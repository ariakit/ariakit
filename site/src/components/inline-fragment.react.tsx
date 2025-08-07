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

interface InlineFragmentProps {
  children?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function InlineFragment({
  children,
  iconLeft,
  iconRight,
}: InlineFragmentProps) {
  return (
    <>
      {iconLeft && (
        <span className="whitespace-nowrap me-[0.25em] select-none">
          {iconLeft}&#x2060;
        </span>
      )}
      {children}
      {iconRight && (
        <span className="whitespace-nowrap ms-[0.25em] select-none">
          &#x2060;{iconRight}
        </span>
      )}
    </>
  );
}
