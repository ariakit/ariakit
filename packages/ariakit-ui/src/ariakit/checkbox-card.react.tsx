import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardLabel,
  checkboxCardSlot,
} from "../styles/checkbox-card.ts";

export interface CheckboxCardProps
  extends ak.CheckboxProps, VariantProps<typeof checkboxCard> {}

/**
 * Card-like label wrapping a visually hidden Ariakit Checkbox, styled from
 * the input's checked/disabled state.
 */
export function CheckboxCard({ children, ...props }: CheckboxCardProps) {
  const [variantProps, rest] = splitProps(props, checkboxCard);
  // The label is never :disabled itself, so mirror the input's disabled prop
  // as the $disabled variant for the card's own disabled visuals.
  return (
    <label {...checkboxCard.jsx({ $disabled: rest.disabled, ...variantProps })}>
      <ak.Checkbox {...rest} />
      {children}
    </label>
  );
}

export interface CheckboxCardLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardLabel> {}

/**
 * Main text of the card. Must be nested inside a `CheckboxCard`.
 */
export function CheckboxCardLabel(props: CheckboxCardLabelProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardLabel);
  return <ak.Role.span {...checkboxCardLabel.jsx(variantProps)} {...rest} />;
}

export interface CheckboxCardSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardSlot> {}

/**
 * Slot for icons or other adornments. Must be nested inside a `CheckboxCard`.
 */
export function CheckboxCardSlot(props: CheckboxCardSlotProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardSlot);
  return <ak.Role.span {...checkboxCardSlot.jsx(variantProps)} {...rest} />;
}

export interface CheckboxCardCheckProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardCheck> {}

/**
 * Circular check indicator that reflects the card's checked state. Must be
 * nested inside a `CheckboxCard`.
 */
export function CheckboxCardCheck(props: CheckboxCardCheckProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardCheck);
  return (
    <ak.Role.span {...checkboxCardCheck.jsx(variantProps)} {...rest}>
      {rest.children || <CheckIcon />}
    </ak.Role.span>
  );
}

export interface CheckboxCardContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardContent> {}

/**
 * Wrapper that stacks the card's label and description. Must be nested
 * inside a `CheckboxCard`.
 */
export function CheckboxCardContent(props: CheckboxCardContentProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardContent);
  return <ak.Role.span {...checkboxCardContent.jsx(variantProps)} {...rest} />;
}

export interface CheckboxCardDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardDescription> {}

/**
 * Secondary text below the label. Must be nested inside a `CheckboxCard`.
 */
export function CheckboxCardDescription(props: CheckboxCardDescriptionProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardDescription);
  return (
    <ak.Role.span {...checkboxCardDescription.jsx(variantProps)} {...rest} />
  );
}
