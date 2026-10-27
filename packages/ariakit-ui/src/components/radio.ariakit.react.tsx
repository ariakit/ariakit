import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { createOptionalRender } from "../react-utils/create-render.react.ts";
import {
  DescriptionContext,
  useDescription,
  useLabelDescription,
} from "../react-utils/use-description.react.ts";
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
  radioGroupLabel,
  radioLabel,
} from "../styles/radio.ts";

export interface RadioProviderProps extends ak.RadioProviderProps {}

/**
 * Provides a radio store to `Radio` descendants. `RadioGroup` and
 * `RadioCardGrid` render their own provider, so a provider around them does not
 * reach their radios. Use their `value`, `setValue`, and `store` props instead.
 * @example
 * <RadioProvider defaultValue="email">
 *   <ak.RadioGroup aria-label="Contact method">
 *     <RadioField value="email">Email</RadioField>
 *     <RadioField value="phone">Phone</RadioField>
 *   </ak.RadioGroup>
 * </RadioProvider>
 */
export function RadioProvider(props: RadioProviderProps) {
  return <ak.RadioProvider {...props} />;
}

export interface RadioGroupProps
  extends
    Omit<ak.RadioGroupProps, "store" | "value" | "defaultValue">,
    Pick<
      ak.RadioProviderProps,
      "store" | "value" | "defaultValue" | "setValue"
    > {
  /**
   * Label content, a custom element, or `RadioGroupLabel` props. The label
   * names the group. Omitted by default; use `aria-label` or `aria-labelledby`
   * to name a group without a visible label.
   */
  label?: React.ReactNode | RadioGroupLabelProps;
}

/**
 * Groups `Radio` components and provides their store, which holds the selected
 * value. Pass `value` and `setValue` to control it, or `store` to sync it with
 * a store from `useRadioStore`.
 * @example
 * <RadioGroup label="Contact method" defaultValue="email">
 *   <RadioField value="email">Email</RadioField>
 *   <RadioField value="phone">Phone</RadioField>
 * </RadioGroup>
 */
export function RadioGroup({
  store,
  value,
  defaultValue,
  setValue,
  label,
  children,
  ...props
}: RadioGroupProps) {
  const defaultLabelId = React.useId();
  const labelElement = createOptionalRender(RadioGroupLabel, label, {
    id: defaultLabelId,
  });
  // The label registers with the group only after hydration, so reference it in
  // the server markup too. Like the core group, let aria-label win.
  const labelId =
    props["aria-label"] != null ? undefined : labelElement?.props.id;
  return (
    <ak.RadioProvider
      store={store}
      value={value}
      defaultValue={defaultValue}
      setValue={setValue}
    >
      <ak.RadioGroup aria-labelledby={labelId} {...props}>
        {labelElement}
        {children}
      </ak.RadioGroup>
    </ak.RadioProvider>
  );
}

export interface RadioGroupLabelProps
  extends ak.RadioGroupLabelProps, VariantProps<typeof radioGroupLabel> {}

/**
 * Visible label of a radio group. It names the group. Must be nested inside a
 * `RadioGroup` or `RadioCardGrid`; their `label` prop puts it first.
 * @example
 * <RadioGroup label={<RadioGroupLabel>Contact method</RadioGroupLabel>}>
 *   <RadioField value="email">Email</RadioField>
 *   <RadioField value="phone">Phone</RadioField>
 * </RadioGroup>
 */
export function RadioGroupLabel(props: RadioGroupLabelProps) {
  const [variantProps, rest] = splitProps(props, radioGroupLabel);
  return (
    <ak.RadioGroupLabel {...radioGroupLabel.jsx(variantProps)} {...rest} />
  );
}

export interface RadioProps extends ak.RadioProps, VariantProps<typeof radio> {}

/**
 * A native radio input with a circular selection mark. Use it inside a
 * `RadioGroup` to share selection and keyboard navigation.
 * @example
 * <RadioGroup aria-label="Contact method">
 *   <label><Radio value="email" /> Email</label>
 *   <label><Radio value="phone" /> Phone</label>
 * </RadioGroup>
 */
export function Radio(props: RadioProps) {
  const [variantProps, rest] = splitProps(props, radio);
  return <ak.Radio {...radio.jsx(variantProps)} {...rest} />;
}

export interface RadioFieldProps
  extends ak.RadioProps, VariantProps<typeof radioField> {}

/**
 * Label row holding a `Radio` before its children, which it stacks so a
 * `RadioDescription` lands under the `RadioLabel`. The label text names the
 * radio, and the description describes it before any `aria-describedby` passed
 * to the field. Variant props style the row; every other prop reaches the
 * input.
 * @example
 * <RadioGroup aria-label="Contact method">
 *   <RadioField value="email">Email</RadioField>
 *   <RadioField value="phone">Phone</RadioField>
 * </RadioGroup>
 */
export function RadioField({ children, ...props }: RadioFieldProps) {
  const [variantProps, rest] = splitProps(props, radioField);
  const { id, describedBy, context } = useLabelDescription(rest);
  // Labels cannot match :disabled, so mirror the input state. CSS handles
  // radios disabled through their group.
  return (
    <DescriptionContext.Provider value={context}>
      <label
        htmlFor={id}
        {...radioField.jsx({
          ...variantProps,
          $disabled: variantProps.$disabled ?? rest.disabled,
        })}
      >
        <Radio {...rest} id={id} aria-describedby={describedBy} />
        <span {...radioContent.jsx()}>{children}</span>
      </label>
    </DescriptionContext.Provider>
  );
}

export interface RadioLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioLabel> {}

/**
 * Label text of a `RadioField`. Must be nested inside a `RadioField`.
 * @example
 * <RadioGroup aria-label="Contact method">
 *   <RadioField value="email">
 *     <RadioLabel>Email</RadioLabel>
 *   </RadioField>
 * </RadioGroup>
 */
export function RadioLabel(props: RadioLabelProps) {
  const [variantProps, rest] = splitProps(props, radioLabel);
  return <ak.Role.span {...radioLabel.jsx(variantProps)} {...rest} />;
}

export interface RadioDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioDescription> {}

/**
 * Secondary text below a `RadioField` label. The radio takes it as its
 * accessible description, so it stays out of the radio's name. A field takes
 * one description; put more secondary text in the same description. A
 * description with its own `id` describes the radio only after hydration. The
 * description is hidden from assistive technologies while it describes, so keep
 * links and other interactive content outside the field. Must be nested inside
 * a `RadioField`.
 * @example
 * <RadioGroup aria-label="Contact method">
 *   <RadioField value="email">
 *     <RadioLabel>Email</RadioLabel>
 *     <RadioDescription>Receive a message in your inbox.</RadioDescription>
 *   </RadioField>
 * </RadioGroup>
 */
export function RadioDescription(props: RadioDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioDescription);
  const { id, describes } = useDescription(rest.id);
  // A hidden element still describes the input that references it.
  return (
    <ak.Role.span
      aria-hidden={describes || undefined}
      {...radioDescription.jsx(variantProps)}
      {...rest}
      id={id}
    />
  );
}

export interface RadioCardProps
  extends ak.RadioProps, VariantProps<typeof radioCard> {}

/**
 * A selectable card with a visually hidden radio input, styled from its checked
 * and disabled state. The card's content names the radio, and a
 * `RadioCardDescription` describes it before any `aria-describedby` passed to
 * the card. Use it inside a `RadioGroup` or `RadioCardGrid`.
 * @example
 * <RadioCardGrid aria-label="Contact method">
 *   <RadioCard value="email">Email</RadioCard>
 *   <RadioCard value="phone">Phone</RadioCard>
 * </RadioCardGrid>
 */
export function RadioCard({ children, ...props }: RadioCardProps) {
  const [variantProps, rest] = splitProps(props, radioCard);
  const { id, describedBy, context } = useLabelDescription(rest);
  // Labels cannot match :disabled, so mirror the input state.
  return (
    <DescriptionContext.Provider value={context}>
      <label
        htmlFor={id}
        {...radioCard.jsx({
          ...variantProps,
          $disabled: variantProps.$disabled ?? rest.disabled,
        })}
      >
        <ak.Radio {...rest} id={id} aria-describedby={describedBy} />
        {children}
      </label>
    </DescriptionContext.Provider>
  );
}

export interface RadioCardCheckProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardCheck> {}

/**
 * The drawn check of a card, reflecting the input's state. Pass a child element
 * to replace the drawn mark. Must be nested inside a `RadioCard`.
 * @example
 * <RadioCardGrid defaultValue="email" aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardCheck />
 *     <RadioCardLabel>Email</RadioCardLabel>
 *   </RadioCard>
 * </RadioCardGrid>
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
 * <RadioCardGrid aria-label="Plan">
 *   <RadioCard value="premium">
 *     <RadioCardSlot aria-hidden>★</RadioCardSlot>
 *     <RadioCardLabel>Premium</RadioCardLabel>
 *   </RadioCard>
 * </RadioCardGrid>
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
 * <RadioCardGrid aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardContent>
 *       <RadioCardLabel>Email</RadioCardLabel>
 *       <RadioCardDescription>Use your inbox.</RadioCardDescription>
 *     </RadioCardContent>
 *   </RadioCard>
 * </RadioCardGrid>
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
 * <RadioCardGrid aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardLabel>Email</RadioCardLabel>
 *   </RadioCard>
 * </RadioCardGrid>
 */
export function RadioCardLabel(props: RadioCardLabelProps) {
  const [variantProps, rest] = splitProps(props, radioCardLabel);
  return <ak.Role.span {...radioCardLabel.jsx(variantProps)} {...rest} />;
}

export interface RadioCardDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardDescription> {}

/**
 * Secondary text below the label. The radio takes it as its accessible
 * description, so it stays out of the radio's name. A card takes one
 * description, and a description with its own `id` describes the radio only
 * after hydration. It is hidden from assistive technologies while it describes,
 * so keep interactive content out of it. Must be nested inside a `RadioCard`.
 * Truncates to one line by default; set `$truncate={false}` to let it wrap.
 * @example
 * <RadioCardGrid aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardContent>
 *       <RadioCardLabel>Email</RadioCardLabel>
 *       <RadioCardDescription>Use your inbox.</RadioCardDescription>
 *     </RadioCardContent>
 *   </RadioCard>
 * </RadioCardGrid>
 */
export function RadioCardDescription(props: RadioCardDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioCardDescription);
  const { id, describes } = useDescription(rest.id);
  // A hidden element still describes the input that references it.
  return (
    <ak.Role.span
      aria-hidden={describes || undefined}
      {...radioCardDescription.jsx(variantProps)}
      {...rest}
      id={id}
    />
  );
}

export interface RadioCardGridProps
  extends RadioGroupProps, VariantProps<typeof radioCardGrid> {}

/**
 * The radio group of a set of `RadioCard`s, laid out as a grid of equal rows.
 * Like `RadioGroup`, it provides the store of its cards. A `label` takes a full
 * row above the cards.
 * @example
 * <RadioCardGrid label="Contact method" defaultValue="email">
 *   <RadioCard value="email">Email</RadioCard>
 *   <RadioCard value="phone">Phone</RadioCard>
 * </RadioCardGrid>
 */
export function RadioCardGrid(props: RadioCardGridProps) {
  const [variantProps, rest] = splitProps(props, radioCardGrid);
  return <RadioGroup {...radioCardGrid.jsx(variantProps)} {...rest} />;
}
