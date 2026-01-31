import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardIcon,
  checkboxCardLabel,
} from "../styles/checkbox-card.ts";

export interface CheckboxCardProps
  extends ComponentProps<"input">,
    VariantProps<typeof checkboxCard> {}

export function CheckboxCard({ children, ...props }: CheckboxCardProps) {
  const [variantProps, rest] = splitProps(props, checkboxCard);
  return (
    <label {...checkboxCard({ $disabled: rest.disabled, ...variantProps })}>
      <input type="checkbox" {...rest} />
      {children}
    </label>
  );
}

export interface CheckboxCardLabelProps
  extends ComponentProps<"span">,
    VariantProps<typeof checkboxCardLabel> {}

export function CheckboxCardLabel(props: CheckboxCardLabelProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardLabel);
  return <span {...checkboxCardLabel(variantProps)} {...rest} />;
}

export interface CheckboxCardIconProps
  extends ComponentProps<"span">,
    VariantProps<typeof checkboxCardIcon> {}

export function CheckboxCardIcon(props: CheckboxCardIconProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardIcon);
  return <span {...checkboxCardIcon(variantProps)} {...rest} />;
}

export interface CheckboxCardCheckProps
  extends ComponentProps<"span">,
    VariantProps<typeof checkboxCardCheck> {}

export function CheckboxCardCheck(props: CheckboxCardCheckProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardCheck);
  return <span {...checkboxCardCheck(variantProps)} {...rest} />;
}
