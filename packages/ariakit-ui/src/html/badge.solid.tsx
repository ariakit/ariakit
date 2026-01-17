import type { VariantProps } from "clava";
import type { ComponentProps, JSXElement } from "solid-js";
import { Show, splitProps } from "solid-js";
import { badge, badgeIcon, badgeText } from "../styles/badge.ts";

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badge>,
    VariantProps<typeof badgeText> {
  iconStart?: JSXElement;
  iconEnd?: JSXElement;
}

export function Badge(props: BadgeProps) {
  const [variantProps, textProps, iconProps, rest] = splitProps(
    props,
    badge.html.propKeys,
    badgeText.variantKeys,
    ["iconStart", "iconEnd"],
  );
  return (
    <div {...badge.html(variantProps)} {...rest}>
      <Show when={iconProps.iconStart}>
        <span {...badgeIcon.html({ $position: "start" })}>
          {iconProps.iconStart}
        </span>
      </Show>
      <span {...badgeText.html(textProps)}>{props.children}</span>
      <Show when={iconProps.iconEnd}>
        <span {...badgeIcon.html({ $position: "end" })}>
          {iconProps.iconEnd}
        </span>
      </Show>
    </div>
  );
}
