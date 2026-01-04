import type { ComponentProps, JSXElement } from "solid-js";
import { mergeProps, Show, splitProps } from "solid-js";
import { button } from "../styles/button.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button>,
    VariantProps<typeof button.text> {
  icon?: JSXElement;
  iconStart?: JSXElement;
  iconEnd?: JSXElement;
}

export function Button(props: ButtonProps) {
  const [variantProps, customProps, buttonRest] = splitProps(
    mergeProps({ ...button.defaultVariants, square: !!props.icon }, props),
    button.variantProps,
    ["icon", "iconStart", "iconEnd"],
  );
  const [textProps, rest] = splitProps(
    mergeProps(button.text.defaultVariants, buttonRest),
    button.text.variantProps,
  );
  return (
    <button {...rest} class={button(variantProps)}>
      <Show when={customProps.iconStart}>
        <span class={button.icon({ position: "start" })}>
          {customProps.iconStart}
        </span>
      </Show>
      {customProps.icon}
      <span class={button.text(textProps)}>{props.children}</span>
      <Show when={customProps.iconEnd}>
        <span class={button.icon({ position: "end" })}>
          {customProps.iconEnd}
        </span>
      </Show>
    </button>
  );
}
