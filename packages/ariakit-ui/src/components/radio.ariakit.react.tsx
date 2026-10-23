import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { wrapsSlotChildren } from "../styles/control.ts";
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
 * @example
 * <RadioProvider defaultValue="email">
 *   <RadioGroup aria-label="Contact method">
 *     <RadioField value="email">Email</RadioField>
 *     <RadioField value="phone">Phone</RadioField>
 *   </RadioGroup>
 * </RadioProvider>
 */
export function RadioProvider(props: RadioProviderProps) {
  return <ak.RadioProvider {...props} />;
}

export interface RadioGroupProps extends ak.RadioGroupProps {}

/**
 * Groups `Radio` components. Requires a `store` prop or a `RadioProvider`
 * ancestor.
 * @example
 * <RadioProvider>
 *   <RadioGroup aria-label="Contact method">
 *     <RadioField value="email">Email</RadioField>
 *     <RadioField value="phone">Phone</RadioField>
 *   </RadioGroup>
 * </RadioProvider>
 */
export function RadioGroup(props: RadioGroupProps) {
  return <ak.RadioGroup {...props} />;
}

export interface RadioProps extends ak.RadioProps, VariantProps<typeof radio> {}

/**
 * A native radio input with a circular selection mark. Use it inside a
 * `RadioGroup` to share selection and keyboard navigation.
 * @example
 * <RadioProvider>
 *   <RadioGroup aria-label="Contact method">
 *     <label><Radio value="email" /> Email</label>
 *     <label><Radio value="phone" /> Phone</label>
 *   </RadioGroup>
 * </RadioProvider>
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
 * @example
 * <RadioProvider>
 *   <RadioGroup aria-label="Contact method">
 *     <RadioField value="email">Email</RadioField>
 *     <RadioField value="phone">Phone</RadioField>
 *   </RadioGroup>
 * </RadioProvider>
 */
export function RadioField({ children, ...props }: RadioFieldProps) {
  const [variantProps, rest] = splitProps(props, radioField);
  // Labels cannot match :disabled, so mirror the input state. CSS handles
  // radios disabled through their group.
  return (
    <label
      {...radioField.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
    >
      <Radio {...rest} />
      <span {...radioContent.jsx()}>{children}</span>
    </label>
  );
}

export interface RadioLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioLabel> {}

/**
 * Label text of a `RadioField`. Must be nested inside a `RadioField`.
 * @example
 * <RadioProvider>
 *   <RadioGroup aria-label="Contact method">
 *     <RadioField value="email">
 *       <RadioLabel>Email</RadioLabel>
 *     </RadioField>
 *   </RadioGroup>
 * </RadioProvider>
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
 * @example
 * <RadioProvider>
 *   <RadioGroup aria-label="Contact method">
 *     <RadioField value="email">
 *       <RadioLabel>Email</RadioLabel>
 *       <RadioDescription>Receive a message in your inbox.</RadioDescription>
 *     </RadioField>
 *   </RadioGroup>
 * </RadioProvider>
 */
export function RadioDescription(props: RadioDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioDescription);
  return <ak.Role.span {...radioDescription.jsx(variantProps)} {...rest} />;
}

export interface RadioCardProps
  extends ak.RadioProps, VariantProps<typeof radioCard> {}

/**
 * A selectable card with a visually hidden radio input, styled from its checked
 * and disabled state. Use it inside a `RadioGroup` or `RadioCardGrid`.
 * @example
 * <RadioProvider>
 *   <RadioCardGrid aria-label="Contact method">
 *     <RadioCard value="email">Email</RadioCard>
 *     <RadioCard value="phone">Phone</RadioCard>
 *   </RadioCardGrid>
 * </RadioProvider>
 */
export function RadioCard({ children, ...props }: RadioCardProps) {
  const [variantProps, rest] = splitProps(props, radioCard);
  // Labels cannot match :disabled, so mirror the input state.
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
 * The drawn check of a card, reflecting the input's state. Pass a child element
 * to replace the drawn mark. Must be nested inside a `RadioCard`.
 * @example
 * <RadioProvider defaultValue="email">
 *   <RadioCardGrid aria-label="Contact method">
 *     <RadioCard value="email">
 *       <RadioCardCheck />
 *       <RadioCardLabel>Email</RadioCardLabel>
 *     </RadioCard>
 *   </RadioCardGrid>
 * </RadioProvider>
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
 * @example
 * <RadioProvider>
 *   <RadioCardGrid aria-label="Plan">
 *     <RadioCard value="premium">
 *       <RadioCardSlot aria-hidden>★</RadioCardSlot>
 *       <RadioCardLabel>Premium</RadioCardLabel>
 *     </RadioCard>
 *   </RadioCardGrid>
 * </RadioProvider>
 */
export function RadioCardSlot(props: RadioCardSlotProps) {
  const [variantProps, rest] = splitProps(props, radioCardSlot);
  const variants = radioCardSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...radioCardSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
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
 * @example
 * <RadioProvider>
 *   <RadioCardGrid aria-label="Contact method">
 *     <RadioCard value="email">
 *       <RadioCardContent>
 *         <RadioCardLabel>Email</RadioCardLabel>
 *         <RadioCardDescription>Use your inbox.</RadioCardDescription>
 *       </RadioCardContent>
 *     </RadioCard>
 *   </RadioCardGrid>
 * </RadioProvider>
 */
export function RadioCardContent(props: RadioCardContentProps) {
  const [variantProps, rest] = splitProps(props, radioCardContent);
  return <ak.Role.span {...radioCardContent.jsx(variantProps)} {...rest} />;
}

export interface RadioCardLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardLabel> {}

/**
 * Main text of the card. Must be nested inside a `RadioCard`. Truncates to one
 * line by default; set `$truncate={false}` to let it wrap.
 * @example
 * <RadioProvider>
 *   <RadioCardGrid aria-label="Contact method">
 *     <RadioCard value="email">
 *       <RadioCardLabel>Email</RadioCardLabel>
 *     </RadioCard>
 *   </RadioCardGrid>
 * </RadioProvider>
 */
export function RadioCardLabel(props: RadioCardLabelProps) {
  const [variantProps, rest] = splitProps(props, radioCardLabel);
  return <ak.Role.span {...radioCardLabel.jsx(variantProps)} {...rest} />;
}

export interface RadioCardDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardDescription> {}

/**
 * Secondary text below the label. Must be nested inside a `RadioCard`.
 * Truncates to one line by default; set `$truncate={false}` to let it wrap.
 * @example
 * <RadioProvider>
 *   <RadioCardGrid aria-label="Contact method">
 *     <RadioCard value="email">
 *       <RadioCardContent>
 *         <RadioCardLabel>Email</RadioCardLabel>
 *         <RadioCardDescription>Use your inbox.</RadioCardDescription>
 *       </RadioCardContent>
 *     </RadioCard>
 *   </RadioCardGrid>
 * </RadioProvider>
 */
export function RadioCardDescription(props: RadioCardDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioCardDescription);
  return <ak.Role.span {...radioCardDescription.jsx(variantProps)} {...rest} />;
}

export interface RadioCardGridProps
  extends ak.RadioGroupProps, VariantProps<typeof radioCardGrid> {}

/**
 * The radio group of a set of `RadioCard`s, laid out as a grid of equal rows.
 * Requires a `store` prop or a `RadioProvider` ancestor.
 * @example
 * <RadioProvider>
 *   <RadioCardGrid aria-label="Contact method">
 *     <RadioCard value="email">Email</RadioCard>
 *     <RadioCard value="phone">Phone</RadioCard>
 *   </RadioCardGrid>
 * </RadioProvider>
 */
export function RadioCardGrid(props: RadioCardGridProps) {
  const [variantProps, rest] = splitProps(props, radioCardGrid);
  return <ak.RadioGroup {...radioCardGrid.jsx(variantProps)} {...rest} />;
}
