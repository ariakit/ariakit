import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { badge, badgeLabel, badgeSlot } from "../styles/badge.ts";
import { wrapsSlotChildren } from "../styles/control.ts";

export interface BadgeProps
  extends ak.RoleProps<"span">, VariantProps<typeof badge> {}

/**
 * A span, so it can sit in running text such as a paragraph or a heading.
 * @example
 * <Badge>New</Badge>
 * @see https://ariakit.com/react/examples/badge
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
 * @see https://ariakit.com/react/examples/badge
 */
export function BadgeLabel(props: BadgeLabelProps) {
  const [variantProps, rest] = splitProps(props, badgeLabel);
  return <ak.Role.span {...badgeLabel.jsx(variantProps)} {...rest} />;
}

export interface BadgeSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof badgeSlot> {}

/**
 * An icon or other content beside a badge label.
 * @example
 * <Badge>
 *   <BadgeSlot aria-hidden>★</BadgeSlot>
 *   <BadgeLabel>Featured</BadgeLabel>
 * </Badge>
 * @see https://ariakit.com/react/examples/badge
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
