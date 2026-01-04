import type { ComponentProps } from "react";
import { button } from "../styles/button.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button>,
    VariantProps<typeof button.text> {
  icon?: React.ReactNode;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export function Button({ icon, iconStart, iconEnd, ...props }: ButtonProps) {
  const [variantProps, buttonRest] = button.splitProps({
    square: !!icon,
    ...props,
  });
  const [textProps, rest] = button.text.splitProps(buttonRest);
  return (
    <button {...rest} className={button(variantProps)}>
      {iconStart && (
        <span className={button.icon({ position: "start" })}>{iconStart}</span>
      )}
      {icon}
      <span className={button.text(textProps)}>{props.children}</span>
      {iconEnd && (
        <span className={button.icon({ position: "end" })}>{iconEnd}</span>
      )}
    </button>
  );
}
