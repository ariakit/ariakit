import type { ComponentProps, JSXElement } from "solid-js";
import { mergeProps, Show, splitProps } from "solid-js";
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
  const [variantProps, customProps, badgeRest] = splitProps(
    mergeProps(badge.defaultVariants, props),
    badge.variantProps,
    ["iconStart", "iconEnd"],
  );
  const [textProps, rest] = splitProps(
    mergeProps(badge.text.defaultVariants, badgeRest),
    badge.text.variantProps,
  );
  return (
    <div {...rest} class={badge(variantProps)}>
      <Show when={customProps.iconStart}>
        <span class={badge.icon({ position: "start" })}>
          {customProps.iconStart}
        </span>
      </Show>
      <span class={badge.text(textProps)}>{props.children}</span>
      <Show when={customProps.iconEnd}>
        <span class={badge.icon({ position: "end" })}>
          {customProps.iconEnd}
        </span>
      </Show>
    </div>
  );
}
