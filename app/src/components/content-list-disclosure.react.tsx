/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ListDisclosureProps } from "@ariakit/ui/ariakit/list.react.tsx";
import {
  ListDisclosure,
  ListDisclosureButton,
} from "@ariakit/ui/ariakit/list.react.tsx";
import type * as React from "react";

export interface ContentListDisclosureProps extends Omit<
  ListDisclosureProps,
  "button"
> {
  /** Content rendered inside the disclosure button. */
  label?: React.ReactNode;
}

/**
 * Disclosure row for docs content lists (e.g. the installation steps),
 * replacing the legacy `ak-list-item > details` auto-styling with the
 * interactive list disclosure components. The label goes through an explicit
 * button element so astro slot content stays button children instead of
 * being mistaken for a render target.
 */
export function ContentListDisclosure({
  label,
  children,
  ...props
}: ContentListDisclosureProps) {
  return (
    <ListDisclosure
      button={<ListDisclosureButton>{label}</ListDisclosureButton>}
      {...props}
    >
      {children}
    </ListDisclosure>
  );
}
