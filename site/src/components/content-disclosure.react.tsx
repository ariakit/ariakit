/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import clsx from "clsx";
import type * as React from "react";

export interface ContentDisclosureProps extends React.ComponentProps<"div"> {
  label?: React.ReactNode;
}

export function ContentDisclosure({
  label,
  children,
  ...props
}: ContentDisclosureProps) {
  return (
    <ak.DisclosureProvider>
      <div
        {...props}
        className={clsx(
          "ak-disclosure has-aria-expanded:ak-disclosure_open ak-frame-field ak-container",
          "ak-container-size-[calc(min(theme(--container-content),100%)+var(--ak-frame-padding)*2)]/0",
          props.className,
        )}
      >
        <ContentDisclosureButton>{label}</ContentDisclosureButton>
        <ContentDisclosureContent>{children}</ContentDisclosureContent>
      </div>
    </ak.DisclosureProvider>
  );
}

export interface ContentDisclosureButtonProps extends ak.DisclosureProps {}

export function ContentDisclosureButton(props: ContentDisclosureButtonProps) {
  return (
    <ak.Disclosure
      {...props}
      className={clsx(
        "ak-disclosure-button before:ak-disclosure-chevron-right @max-3xl:px-0",
        props.className,
      )}
    />
  );
}

export interface ContentDisclosureContentProps
  extends ak.DisclosureContentProps {}

export function ContentDisclosureContent(props: ContentDisclosureContentProps) {
  return (
    <ak.DisclosureContent
      {...props}
      className={clsx(
        "ak-disclosure-content *:ak-frame-force-card @max-3xl:*:px-0",
        props.className,
      )}
    >
      {props.children}
    </ak.DisclosureContent>
  );
}
