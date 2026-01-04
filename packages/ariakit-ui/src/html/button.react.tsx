import type { ComponentProps } from "react";
import { button } from "../styles/button.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface BadgeProps
  extends ComponentProps<"button">,
    VariantProps<typeof button>,
    VariantProps<typeof button.text> {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export function Badge(props: BadgeProps) {
  const [variantProps, buttonRest] = button.splitProps(props);
  const [textProps, rest] = button.text.splitProps(buttonRest);
  return (
    <button {...rest} className={button(variantProps)}>
      {props.iconStart && (
        <span className={button.icon({ position: "start" })}>
          {props.iconStart}
        </span>
      )}
      <span className={button.text(textProps)}>{props.children}</span>
      {props.iconEnd && (
        <span className={button.icon({ position: "end" })}>
          {props.iconEnd}
        </span>
      )}
    </button>
  );
}
