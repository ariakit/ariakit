import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ReactNode } from "react";
import { Children } from "react";
import { badge, badgeLabel, badgeSlot } from "../styles/badge.ts";

export interface BadgeProps
  extends ak.RoleProps<"span">, VariantProps<typeof badge> {}

/** Whether the children are only text and numbers, such as `{count} new`. */
function isPlainText(children: ReactNode) {
  const nodes = Children.toArray(children);
  if (!nodes.length) return false;
  return nodes.every((node) => {
    return typeof node === "string" || typeof node === "number";
  });
}

/**
 * An inline badge for a short label or status. Plain text and numbers go in a
 * `BadgeLabel` automatically. Add `BadgeLabel` yourself when the badge also has
 * an icon. In a slot, the badge fills the slot height. Use a `box` slot, which
 * takes the width of the badge.
 * @example
 * <Badge>New</Badge>
 * @example
 * <Button>
 *   <ButtonLabel>Inbox</ButtonLabel>
 *   <ButtonSlot $kind="box">
 *     <Badge $kind="solid" $round>3</Badge>
 *   </ButtonSlot>
 * </Button>
 */
export function Badge(props: BadgeProps) {
  const [variantProps, rest] = splitProps(props, badge);
  return (
    <ak.Role.span {...badge.jsx(variantProps)} {...rest}>
      {isPlainText(rest.children) ? (
        <BadgeLabel>{rest.children}</BadgeLabel>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface BadgeLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof badgeLabel> {}

/**
 * Text inside a badge, aligned to the capital height. `Badge` adds it
 * automatically around plain text.
 * @example
 * <Badge>
 *   <BadgeSlot aria-hidden>★</BadgeSlot>
 *   <BadgeLabel>Featured</BadgeLabel>
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
  return <ak.Role.span {...badgeSlot.jsx(variantProps)} {...rest} />;
}
