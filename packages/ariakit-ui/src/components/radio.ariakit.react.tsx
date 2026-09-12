import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import {
  radio,
  radioCard,
  radioCardCheck,
  radioCardContent,
  radioCardDescription,
  radioCardGrid,
  radioCardLabel,
  radioCardSlot,
  radioContent,
  radioDescription,
  radioField,
  radioLabel,
} from "../styles/radio.ts";

export interface RadioProviderProps extends ak.RadioProviderProps {}

/**
 * Provides a radio store to `RadioGroup` and `Radio` descendants.
 * @see https://ariakit.com/reference/radio-provider
 */
export function RadioProvider(props: RadioProviderProps) {
  return <ak.RadioProvider {...props} />;
}

export interface RadioGroupProps extends ak.RadioGroupProps {}

/**
 * Groups `Radio` components. Requires a `store` prop or a `RadioProvider`
 * ancestor.
 * @see https://ariakit.com/reference/radio-group
 */
export function RadioGroup(props: RadioGroupProps) {
  return <ak.RadioGroup {...props} />;
}

export interface RadioProps extends ak.RadioProps, VariantProps<typeof radio> {}

/**
 * Native radio drawn by CSS: a disc that fills brand with a dot. Requires a
 * `RadioProvider` ancestor and a `RadioGroup` around it, like `ak.Radio`.
 * @see https://ariakit.com/reference/radio
 */
export function Radio(props: RadioProps) {
  const [variantProps, rest] = splitProps(props, radio);
  return <ak.Radio {...radio.jsx(variantProps)} {...rest} />;
}

export interface RadioFieldProps
  extends ak.RadioProps, VariantProps<typeof radioField> {}

/**
 * Label row holding a `Radio` before its children, which it stacks so a
 * `RadioDescription` lands under the `RadioLabel`. Variant props style the row;
 * every other prop reaches the input.
 */
export function RadioField({ children, ...props }: RadioFieldProps) {
  const [variantProps, rest] = splitProps(props, radioField);
  // The label is never :disabled itself, so mirror the input's disabled prop as
  // the $disabled variant for the row's own disabled visuals. A radio disabled
  // through its group reaches the row through CSS instead.
  return (
    <label
      {...radioField.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
    >
      <Radio {...rest} />
      <span {...radioContent.jsx({})}>{children}</span>
    </label>
  );
}

export interface RadioLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioLabel> {}

/**
 * Label text of a `RadioField`. Must be nested inside a `RadioField`.
 */
export function RadioLabel(props: RadioLabelProps) {
  const [variantProps, rest] = splitProps(props, radioLabel);
  return <ak.Role.span {...radioLabel.jsx(variantProps)} {...rest} />;
}

export interface RadioDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioDescription> {}

/**
 * Secondary text below a `RadioField` label. Must be nested inside a
 * `RadioField`.
 */
export function RadioDescription(props: RadioDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioDescription);
  return <ak.Role.span {...radioDescription.jsx(variantProps)} {...rest} />;
}

export interface RadioCardProps
  extends ak.RadioProps, VariantProps<typeof radioCard> {}

/**
 * Card-like label wrapping an Ariakit Radio kept out of sight, styled from the
 * input's checked and disabled state. Requires a `RadioProvider` ancestor and a
 * `RadioGroup` (or `RadioCardGrid`) around it.
 */
export function RadioCard({ children, ...props }: RadioCardProps) {
  const [variantProps, rest] = splitProps(props, radioCard);
  // The label is never :disabled itself, so mirror the input's disabled prop as
  // the $disabled variant for the card's own disabled visuals.
  return (
    <label
      {...radioCard.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
    >
      <ak.Radio {...rest} />
      {children}
    </label>
  );
}

export interface RadioCardCheckProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardCheck> {}

/**
 * The drawn check of a card, reflecting the input's state. Pass a child to
 * replace the drawn mark. Must be nested inside a `RadioCard`.
 */
export function RadioCardCheck(props: RadioCardCheckProps) {
  const [variantProps, rest] = splitProps(props, radioCardCheck);
  // Decorative: the input announces the state.
  return (
    <ak.Role.span aria-hidden {...radioCardCheck.jsx(variantProps)} {...rest} />
  );
}

export interface RadioCardSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardSlot> {}

/**
 * Slot for icons or other adornments. Must be nested inside a `RadioCard`.
 */
export function RadioCardSlot(props: RadioCardSlotProps) {
  const [variantProps, rest] = splitProps(props, radioCardSlot);
  const variants = radioCardSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...radioCardSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "avatar" && typeof rest.children === "string" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface RadioCardContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardContent> {}

/**
 * Wrapper that stacks the card's label and description. Must be nested inside a
 * `RadioCard`.
 */
export function RadioCardContent(props: RadioCardContentProps) {
  const [variantProps, rest] = splitProps(props, radioCardContent);
  return <ak.Role.span {...radioCardContent.jsx(variantProps)} {...rest} />;
}

export interface RadioCardLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardLabel> {}

/**
 * Main text of the card. Must be nested inside a `RadioCard`.
 */
export function RadioCardLabel(props: RadioCardLabelProps) {
  const [variantProps, rest] = splitProps(props, radioCardLabel);
  return <ak.Role.span {...radioCardLabel.jsx(variantProps)} {...rest} />;
}

export interface RadioCardDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardDescription> {}

/**
 * Secondary text below the label. Must be nested inside a `RadioCard`.
 */
export function RadioCardDescription(props: RadioCardDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioCardDescription);
  return <ak.Role.span {...radioCardDescription.jsx(variantProps)} {...rest} />;
}

export interface RadioCardGridProps
  extends ak.RadioGroupProps, VariantProps<typeof radioCardGrid> {}

/**
 * The radio group of a set of `RadioCard`s, laid out as a grid of equal rows.
 * Requires a `RadioProvider` ancestor.
 */
export function RadioCardGrid(props: RadioCardGridProps) {
  const [variantProps, rest] = splitProps(props, radioCardGrid);
  return <ak.RadioGroup {...radioCardGrid.jsx(variantProps)} {...rest} />;
}
