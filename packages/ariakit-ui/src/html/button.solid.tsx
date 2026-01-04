import type { ComponentProps, JSXElement } from "solid-js";
import { Show, splitProps } from "solid-js";
import { button } from "../styles/button.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface buttonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button>,
    VariantProps<typeof button.text> {
  iconStart?: JSXElement;
  iconEnd?: JSXElement;
}

export function Button(props: buttonProps) {
  const [variantProps, iconProps, buttonRest] = splitProps(
    props,
    button.variantProps,
    ["iconStart", "iconEnd"],
  );
  const [textProps, rest] = button.text.splitProps(buttonRest);
  return (
    <button {...rest} class={button(variantProps)}>
      <Show when={iconProps.iconStart}>
        <span class={button.icon({ position: "start" })}>
          {iconProps.iconStart}
        </span>
      </Show>
      <span class={button.text(textProps)}>{props.children}</span>
      <Show when={iconProps.iconEnd}>
        <span class={button.icon({ position: "end" })}>
          {iconProps.iconEnd}
        </span>
      </Show>
    </button>
  );
}
