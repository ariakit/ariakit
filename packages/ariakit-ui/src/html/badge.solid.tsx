import type { ComponentProps, JSXElement } from "solid-js";
import { Show, splitProps } from "solid-js";
import { badge } from "../styles/badge.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badge>,
    VariantProps<typeof badge.text> {
  iconStart?: JSXElement;
  iconEnd?: JSXElement;
}

export function Badge(props: BadgeProps) {
  const [variantProps, iconProps, badgeRest] = splitProps(
    props,
    badge.variantProps,
    ["iconStart", "iconEnd"],
  );
  const [textProps, rest] = badge.text.splitProps(badgeRest);
  return (
    <div {...rest} class={badge(variantProps)}>
      <Show when={iconProps.iconStart}>
        <span class={badge.icon({ position: "start" })}>
          {iconProps.iconStart}
        </span>
      </Show>
      <span class={badge.text(textProps)}>{props.children}</span>
      <Show when={iconProps.iconEnd}>
        <span class={badge.icon({ position: "end" })}>{iconProps.iconEnd}</span>
      </Show>
    </div>
  );
}
