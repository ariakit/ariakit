import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardLabel,
  checkboxCardSlot,
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

export interface CheckboxCardSlotProps
  extends ComponentProps<"span">,
    VariantProps<typeof checkboxCardSlot> {}

export function CheckboxCardSlot(props: CheckboxCardSlotProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardSlot);
  return <span {...checkboxCardSlot(variantProps)} {...rest} />;
}

export interface CheckboxCardCheckProps
  extends ComponentProps<"span">,
    VariantProps<typeof checkboxCardCheck> {}

export function CheckboxCardCheck(props: CheckboxCardCheckProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardCheck);
  return (
    <span {...checkboxCardCheck(variantProps)} {...rest}>
      {rest.children || <CheckIcon />}
    </span>
  );
}

export interface CheckboxCardContentProps
  extends ComponentProps<"span">,
    VariantProps<typeof checkboxCardContent> {}

export function CheckboxCardContent(props: CheckboxCardContentProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardContent);
  return <span {...checkboxCardContent(variantProps)} {...rest} />;
}

export interface CheckboxCardDescriptionProps
  extends ComponentProps<"span">,
    VariantProps<typeof checkboxCardDescription> {}

export function CheckboxCardDescription(props: CheckboxCardDescriptionProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardDescription);
  return <span {...checkboxCardDescription(variantProps)} {...rest} />;
}
