import type { VariantProps } from "clava";
import type { ComponentProps, JSXElement } from "solid-js";
import { Show, splitProps } from "solid-js";
import { badge, badgeLabel, badgeSlot } from "../styles/badge.ts";

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badge>,
    VariantProps<typeof badgeLabel> {
  iconStart?: JSXElement;
  iconEnd?: JSXElement;
}

export function Badge(props: BadgeProps) {
  const [variantProps, textProps, iconProps, rest] = splitProps(
    props,
    badge.html.propKeys,
    badgeLabel.variantKeys,
    ["iconStart", "iconEnd"],
  );
  return (
    <div {...badge.html(variantProps)} {...rest}>
      <Show when={iconProps.iconStart}>
        <span {...badgeSlot.html({ $position: "start" })}>
          {iconProps.iconStart}
        </span>
      </Show>
      <span {...badgeLabel.html(textProps)}>{props.children}</span>
      <Show when={iconProps.iconEnd}>
        <span {...badgeSlot.html({ $position: "end" })}>
          {iconProps.iconEnd}
        </span>
      </Show>
    </div>
  );
}
