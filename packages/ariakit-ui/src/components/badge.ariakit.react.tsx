import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { badge, badgeLabel, badgeSlot } from "../styles/badge.ts";

export interface BadgeProps
  extends ak.RoleProps<"span">, VariantProps<typeof badge> {}

/**
 * A span, so it can sit in running text such as a paragraph or a heading.
 * @see https://ariakit.com/react/examples/badge
 */
export function Badge(props: BadgeProps) {
  const [variantProps, rest] = splitProps(props, badge);
  return <ak.Role.span {...badge.jsx(variantProps)} {...rest} />;
}

export interface BadgeLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof badgeLabel> {}

/**
 * @see https://ariakit.com/react/examples/badge
 */
export function BadgeLabel(props: BadgeLabelProps) {
  const [variantProps, rest] = splitProps(props, badgeLabel);
  return <ak.Role.span {...badgeLabel.jsx(variantProps)} {...rest} />;
}

export interface BadgeSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof badgeSlot> {}

/**
 * @see https://ariakit.com/react/examples/badge
 */
export function BadgeSlot(props: BadgeSlotProps) {
  const [variantProps, rest] = splitProps(props, badgeSlot);
  const variants = badgeSlot.getVariants(variantProps);
  // The badge kind sizes the count through a child element, which a bare text
  // node is not.
  return (
    <ak.Role.span {...badgeSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
