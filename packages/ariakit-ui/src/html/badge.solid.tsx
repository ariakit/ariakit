import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { badge, badgeLabel, badgeSlot } from "../styles/badge.ts";

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badge> {}

/**
 * @see https://ariakit.com/solid/examples/badge
 */
export function Badge(props: BadgeProps) {
  const [variantProps, rest] = splitProps(props, badge.html.propKeys);
  return <div {...badge.html(variantProps)} {...rest} />;
}

export interface BadgeLabelProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeLabel> {}

/**
 * @see https://ariakit.com/solid/examples/badge
 */
export function BadgeLabel(props: BadgeLabelProps) {
  const [variantProps, rest] = splitProps(props, badgeLabel.html.propKeys);
  return <span {...badgeLabel.html(variantProps)} {...rest} />;
}

export interface BadgeSlotProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeSlot> {}

/**
 * @see https://ariakit.com/solid/examples/badge
 */
export function BadgeSlot(props: BadgeSlotProps) {
  const [variantProps, rest] = splitProps(props, badgeSlot.html.propKeys);
  return <span {...badgeSlot.html(variantProps)} {...rest} />;
}
