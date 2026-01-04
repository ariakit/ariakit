import type { ComponentProps, JSXElement } from "solid-js";
import { Show, splitProps } from "solid-js";
import { badge } from "../styles/badge.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface BadgeProps
  extends VariantProps<typeof badge>,
    ComponentProps<"div"> {
  iconStart?: JSXElement;
  iconEnd?: JSXElement;
}

export function Badge(props: BadgeProps) {
  const [variantProps, iconProps, rest] = splitProps(
    props,
    badge.variantProps,
    ["iconStart", "iconEnd"],
  );
  return (
    <div {...rest} class={badge(variantProps)}>
      <Show when={iconProps.iconStart}>
        <span class={badge.icon({ position: "start" })}>
          {iconProps.iconStart}
        </span>
      </Show>
      <span class={badge.text()}>{props.children}</span>
      <Show when={iconProps.iconEnd}>
        <span class={badge.icon({ position: "end" })}>{iconProps.iconEnd}</span>
      </Show>
    </div>
  );
}
