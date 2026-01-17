import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { button, buttonIcon, buttonText } from "../styles/button.ts";

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button>,
    VariantProps<typeof buttonText> {
  icon?: React.ReactNode;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export function Button({ icon, iconStart, iconEnd, ...props }: ButtonProps) {
  const [variantProps, textProps, rest] = splitProps(
    { $square: !!icon, ...props } satisfies ButtonProps,
    button,
    buttonText,
  );
  return (
    <button {...button(variantProps)} {...rest}>
      {iconStart && (
        <span {...buttonIcon({ $position: "start" })}>{iconStart}</span>
      )}
      {icon}
      <span {...buttonText(textProps)}>{props.children}</span>
      {iconEnd && <span {...buttonIcon({ $position: "end" })}>{iconEnd}</span>}
    </button>
  );
}
