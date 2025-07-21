/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "#app/icons/icon.react.tsx";
import { InlineFragment } from "./inline-fragment.react.tsx";

interface InlineLinkProps extends ComponentProps<"a"> {
  newWindow?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function InlineLink({
  newWindow,
  children,
  className,
  iconLeft,
  iconRight,
  ...props
}: InlineLinkProps) {
  return (
    <a
      {...props}
      className={clsx("ak-link", className)}
      target={newWindow ? "_blank" : undefined}
      rel={newWindow ? "noopener noreferrer nofollow" : undefined}
    >
      <InlineFragment
        iconLeft={iconLeft}
        iconRight={iconRight || (newWindow && <Icon name="newWindow" />)}
      >
        {children}
      </InlineFragment>
    </a>
  );
}
