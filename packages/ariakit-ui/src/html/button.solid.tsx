import type { VariantProps } from "clava";
import type { ComponentProps, JSXElement } from "solid-js";
import { mergeProps, Show, splitProps } from "solid-js";
import { button, buttonIcon, buttonText } from "../styles/button.ts";

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button>,
    VariantProps<typeof buttonText> {
  icon?: JSXElement;
  iconStart?: JSXElement;
  iconEnd?: JSXElement;
}

export function Button(props: ButtonProps) {
  const defaultVariants: ButtonProps = {
    $square: !!props.icon,
  };
  const [variantProps, textProps, iconProps, rest] = splitProps(
    mergeProps(defaultVariants, props),
    button.html.propKeys,
    buttonText.variantKeys,
    ["icon", "iconStart", "iconEnd"],
  );
  return (
    <button {...button.html(variantProps)} {...rest}>
      <Show when={iconProps.iconStart}>
        <span {...buttonIcon.html({ $position: "start" })}>
          {iconProps.iconStart}
        </span>
      </Show>
      {iconProps.icon}
      <span {...buttonText.html(textProps)}>{props.children}</span>
      <Show when={iconProps.iconEnd}>
        <span {...buttonIcon.html({ $position: "end" })}>
          {iconProps.iconEnd}
        </span>
      </Show>
    </button>
  );
}
