import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { badge, badgeLabel, badgeSlot } from "../styles/badge.ts";

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badge> {}

/**
 * @see https://ariakit.com/react/examples/badge
 */
export function Badge(props: BadgeProps) {
  const [variantProps, rest] = splitProps(props, badge);
  return <div {...badge(variantProps)} {...rest} />;
}

export interface BadgeLabelProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeLabel> {}

/**
 * @see https://ariakit.com/react/examples/badge
 */
export function BadgeLabel(props: BadgeLabelProps) {
  const [variantProps, rest] = splitProps(props, badgeLabel);
  return <span {...badgeLabel(variantProps)} {...rest} />;
}

export interface BadgeSlotProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeSlot> {}

/**
 * @see https://ariakit.com/react/examples/badge
 */
export function BadgeSlot(props: BadgeSlotProps) {
  const [variantProps, rest] = splitProps(props, badgeSlot);
  return <span {...badgeSlot(variantProps)} {...rest} />;
}
