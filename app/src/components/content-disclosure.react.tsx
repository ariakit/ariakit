/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/ariakit/disclosure.react.tsx";
import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "@ariakit/ui/ariakit/disclosure.react.tsx";
import { container } from "@ariakit/ui/styles/container.ts";
import { clsx } from "clsx";
import type * as React from "react";
import { containerSizeContent } from "#app/lib/container-size.ts";

// The docs content column plus the disclosure frame padding on both sides,
// so the button text aligns with the surrounding prose.
const containerProps = container.jsx({
  $size: `calc(min(${containerSizeContent}, 100%) + var(--ak-frame-padding) * 2)`,
  $p: "none",
});

export interface ContentDisclosureProps extends Omit<
  DisclosureProps,
  "button" | "content"
> {
  /** Content rendered inside the disclosure button. */
  label?: React.ReactNode;
  /**
   * Styles the disclosure as a standalone prose card (layered, ring) rather
   * than the flat field used between reference blocks.
   */
  prose?: boolean;
}

export function ContentDisclosure({
  label,
  prose,
  children,
  ...props
}: ContentDisclosureProps) {
  return (
    <Disclosure
      button={
        <ContentDisclosureButton prose={prose}>{label}</ContentDisclosureButton>
      }
      content={<ContentDisclosureContent prose={prose} />}
      {...props}
      className={clsx(
        "ak-frame",
        prose ? "ak-frame-card/card ak-layer-3 ring" : "ak-frame-field/field",
        containerProps.className,
        props.className,
      )}
      style={{ ...containerProps.style, ...props.style }}
    >
      {children}
    </Disclosure>
  );
}

export interface ContentDisclosureButtonProps extends DisclosureButtonProps {
  /** Matches the root's `prose` variant. */
  prose?: boolean;
}

export function ContentDisclosureButton({
  prose,
  ...props
}: ContentDisclosureButtonProps) {
  return (
    <DisclosureButton
      {...props}
      className={clsx(!prose && "@max-3xl:px-0", props.className)}
    />
  );
}

export interface ContentDisclosureContentProps extends DisclosureContentProps {
  /** Matches the root's `prose` variant. */
  prose?: boolean;
}

export function ContentDisclosureContent({
  prose,
  ...props
}: ContentDisclosureContentProps) {
  if (prose) {
    // The body is the prose gap column, like the legacy ak-prose-content div
    // inside the details element.
    return (
      <DisclosureContent
        body={{ className: "flex flex-col gap-(--prose-gap)" }}
        {...props}
      />
    );
  }
  return (
    <DisclosureContent
      {...props}
      className={clsx(
        "*:ak-frame *:ak-frame-force *:ak-frame-card/card @max-3xl:*:px-0",
        props.className,
      )}
    />
  );
}
