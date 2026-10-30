import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { badge, badgeLabel, badgeSlot } from "../styles/badge.ts";
import { wrapsSlotChildren } from "../styles/slot-frame.ts";

export interface BadgeProps
  extends ak.RoleProps<"span">, VariantProps<typeof badge> {}

/**
 * An inline badge for a short label or status. Wrap its text in `BadgeLabel` to
 * apply the badge's text color and alignment.
 * @example
 * <Badge>
 *   <BadgeLabel>New</BadgeLabel>
 * </Badge>
 */
export function Badge(props: BadgeProps) {
  const [variantProps, rest] = splitProps(props, badge);
  return <ak.Role.span {...badge.jsx(variantProps)} {...rest} />;
}

export interface BadgeLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof badgeLabel> {}

/**
 * Text inside a badge, aligned to the capital height.
 * @example
 * <Badge>
 *   <BadgeLabel>New</BadgeLabel>
 * </Badge>
 */
export function BadgeLabel(props: BadgeLabelProps) {
  const [variantProps, rest] = splitProps(props, badgeLabel);
  return <ak.Role.span {...badgeLabel.jsx(variantProps)} {...rest} />;
}

export interface BadgeSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof badgeSlot> {}

/**
 * An icon or other content beside a badge label. Pass `aria-hidden` when the
 * entire slot is decorative.
 * @example
 * <Badge>
 *   <BadgeSlot aria-hidden>★</BadgeSlot>
 *   <BadgeLabel>Featured</BadgeLabel>
 * </Badge>
 */
export function BadgeSlot(props: BadgeSlotProps) {
  const [variantProps, rest] = splitProps(props, badgeSlot);
  const variants = badgeSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...badgeSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
