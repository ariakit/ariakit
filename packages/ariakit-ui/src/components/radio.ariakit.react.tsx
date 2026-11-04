import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  createOptionalRender,
  getChildrenText,
} from "../react-utils/create-render.react.ts";
import {
  DescriptionContext,
  useDescription,
  useDescribedBy,
  useLabelDescription,
} from "../react-utils/use-description.react.ts";
import { buttonGroup } from "../styles/button.ts";
import {
  radio,
  radioCard,
  radioCardCheck,
  radioCardContent,
  radioCardDescription,
  radioCardGrid,
  radioCardLabel,
  radioCardLabelRow,
  radioCardSlot,
  radioContent,
  radioDescription,
  radioField,
  radioGroup,
  radioGroupDescription,
  radioGroupLabel,
  radioLabel,
  radioList,
} from "../styles/radio.ts";
import { isSegmentedKind } from "../styles/segment.ts";

export interface RadioProviderProps extends ak.RadioProviderProps {}

/**
 * Provides a radio store to `Radio` descendants. `RadioGroup` renders its own
 * provider, so a provider around it does not reach its radios. Use its `value`,
 * `setValue`, and `store` props instead.
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
    >,
    Omit<VariantProps<typeof buttonGroup>, "$gap"> {
  /**
   * Sets the gap between the label, the description, the radios, and an error.
   * Each size gives one spacing step more to a group that holds cards or radios
   * with descriptions. `auto` is the default `md` size. With
   * `$kind="segmented"`, it sets the gap between the segments instead, and
   * `auto` uses the padding of the segmented control.
   * @default "auto"
   */
  $gap?: VariantProps<typeof buttonGroup>["$gap"];
  /**
   * Label content, a `RadioGroupLabel` element, or `RadioGroupLabel` props. The
   * label names the group. An element of another type replaces it and names the
   * group only if it renders a `RadioGroupLabel`. Omitted by default; use
   * `aria-label` or `aria-labelledby` to name a group without a visible label.
   */
  label?: React.ReactNode | RadioGroupLabelProps;
  /**
   * Description content, a `RadioGroupDescription` element, or
   * `RadioGroupDescription` props. It goes right after the label and describes
   * the group before any `aria-describedby` passed to the group. An element of
   * another type replaces it and describes the group only if it renders a
   * `RadioGroupDescription`. Omitted by default.
   */
  description?: React.ReactNode | RadioGroupDescriptionProps;
}

/**
 * Groups `Radio` components and provides their store, which holds the selected
 * value. Pass `value` and `setValue` to control it, or `store` to sync it with
 * a store from `useRadioStore`. It stacks its `label`, its `description`, its
 * radios, and an error with the group gap, which `$gap` sets. Put the radios in
 * a `RadioList` or a `RadioCardGrid`, whose gap is two thirds of the group gap
 * by default, so the label stays further from the radios than they are from
 * each other. With `$kind="segmented"`, it lays out `RadioCard`s with the same
 * kind as a segmented control, and the other variant props style the segments.
 * They have no effect on other groups, but `$gap` then spaces the segments. A
 * `label` then goes above the segments, and `className` and `style` go on the
 * element that holds both.
 * @example
 * <RadioGroup label="Contact method" defaultValue="email">
 *   <RadioList>
 *     <RadioField value="email">Email</RadioField>
 *     <RadioField value="phone">Phone</RadioField>
 *   </RadioList>
 * </RadioGroup>
 * @example
 * <RadioGroup label="View" defaultValue="list" $kind="segmented">
 *   <RadioCard value="list" $kind="segmented">
 *     <RadioCardLabel>List</RadioCardLabel>
 *   </RadioCard>
 *   <RadioCard value="grid" $kind="segmented">
 *     <RadioCardLabel>Grid</RadioCardLabel>
 *   </RadioCard>
 * </RadioGroup>
 */
export function RadioGroup({
  store,
  value,
  defaultValue,
  setValue,
  label,
  description,
  children,
  ...props
}: RadioGroupProps) {
  const [variantProps, rest] = splitProps(props, buttonGroup);
  const { className, style, $gap, ...variants } = variantProps;
  const { describedBy, context } = useDescribedBy(rest["aria-describedby"]);
  const labelElement = createOptionalRender(RadioGroupLabel, label);
  const descriptionElement = createOptionalRender(
    RadioGroupDescription,
    description,
  );
  const segmented = variants.$kind === "segmented";
  const content = () => {
    // Without texts, the group itself holds the segments.
    if (segmented && !labelElement && !descriptionElement) {
      return (
        <ak.RadioGroup
          {...buttonGroup.jsx(variantProps)}
          {...rest}
          aria-describedby={describedBy}
        >
          {children}
        </ak.RadioGroup>
      );
    }
    // A segmented group's gap spaces the segments, so the texts above them keep
    // the default gap. The auto gap of segments has no group size.
    const groupGap = segmented || $gap === "auto" ? undefined : $gap;
    return (
      <ak.RadioGroup
        {...radioGroup.jsx({ className, style, $gap: groupGap })}
        {...rest}
        aria-describedby={describedBy}
      >
        {labelElement}
        {descriptionElement}
        {segmented ? (
          <div {...buttonGroup.jsx({ ...variants, $gap })}>{children}</div>
        ) : (
          children
        )}
      </ak.RadioGroup>
    );
  };
  return (
    <ak.RadioProvider
      store={store}
      value={value}
      defaultValue={defaultValue}
      setValue={setValue}
    >
      <DescriptionContext.Provider value={context}>
        {content()}
      </DescriptionContext.Provider>
    </ak.RadioProvider>
  );
}

export interface RadioGroupLabelProps
  extends ak.RadioGroupLabelProps, VariantProps<typeof radioGroupLabel> {}

/**
 * Visible label of a radio group. It names the group and has the same text
 * style as an `InputLabel`. Must be nested inside a `RadioGroup`; its `label`
 * prop puts it first.
 * @example
 * <RadioGroup label={<RadioGroupLabel>Contact method</RadioGroupLabel>}>
 *   <RadioList>
 *     <RadioField value="email">Email</RadioField>
 *     <RadioField value="phone">Phone</RadioField>
 *   </RadioList>
 * </RadioGroup>
 */
export function RadioGroupLabel(props: RadioGroupLabelProps) {
  const [variantProps, rest] = splitProps(props, radioGroupLabel);
  return (
    <ak.RadioGroupLabel {...radioGroupLabel.jsx(variantProps)} {...rest} />
  );
}

export interface RadioGroupDescriptionProps
  extends ak.RoleProps<"div">, VariantProps<typeof radioGroupDescription> {}

/**
 * Secondary text of a radio group, such as a hint about all of its radios. The
 * group takes it as its accessible description. Right after the label, it sits
 * close under it. A group takes one description. Must be nested inside a
 * `RadioGroup`; its `description` prop puts it after the label.
 * @example
 * <RadioGroup
 *   label="Delivery time"
 *   description="Times are in your local time zone."
 * >
 *   <RadioList>
 *     <RadioField value="morning">Morning</RadioField>
 *     <RadioField value="evening">Evening</RadioField>
 *   </RadioList>
 * </RadioGroup>
 */
export function RadioGroupDescription(props: RadioGroupDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioGroupDescription);
  const { id } = useDescription(rest.id);
  return (
    <ak.Role.div
      {...radioGroupDescription.jsx(variantProps)}
      {...rest}
      id={id}
    />
  );
}

export interface RadioListProps
  extends ak.RoleProps<"div">, VariantProps<typeof radioList> {}

/**
 * Stacks the `RadioField`s or `RadioCard`s of a `RadioGroup`. Its `$gap` spaces
 * the radios, and the `auto` default takes two thirds of the group gap. It adds
 * no role. Must be nested inside a `RadioGroup`.
 * @example
 * <RadioGroup label="Contact method" defaultValue="email">
 *   <RadioList>
 *     <RadioField value="email">Email</RadioField>
 *     <RadioField value="phone">Phone</RadioField>
 *   </RadioList>
 * </RadioGroup>
 */
export function RadioList(props: RadioListProps) {
  const [variantProps, rest] = splitProps(props, radioList);
  return <ak.Role.div {...radioList.jsx(variantProps)} {...rest} />;
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
 * the card. Use it inside a `RadioGroup`, and lay out the cards with a
 * `RadioCardGrid` or a `RadioList`. With `$kind="segmented"` or
 * `$kind="segmented-flat"`, it is a segment of a `RadioGroup` with
 * `$kind="segmented"`, and a `Tooltip` around it anchors to the whole segment.
 * @example
 * <RadioGroup aria-label="Contact method">
 *   <RadioCardGrid>
 *     <RadioCard value="email">Email</RadioCard>
 *     <RadioCard value="phone">Phone</RadioCard>
 *   </RadioCardGrid>
 * </RadioGroup>
 */
export function RadioCard({ children, ...props }: RadioCardProps) {
  const [variantProps, rest] = splitProps(props, radioCard);
  const { id, describedBy, context } = useLabelDescription(rest);
  // Labels cannot match :disabled, so mirror the input state. A segment reads
  // it from the input instead, because the variant removes the surface of the
  // thumb, which is the only mark of a checked segment.
  const disabled = isSegmentedKind(variantProps.$kind)
    ? undefined
    : rest.disabled;
  return (
    <DescriptionContext.Provider value={context}>
      <label
        htmlFor={id}
        {...radioCard.jsx({
          ...variantProps,
          $disabled: variantProps.$disabled ?? disabled,
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
 * <RadioGroup defaultValue="email" aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardCheck />
 *     <RadioCardLabel>Email</RadioCardLabel>
 *   </RadioCard>
 * </RadioGroup>
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
 * <RadioGroup aria-label="Plan">
 *   <RadioCard value="premium">
 *     <RadioCardSlot aria-hidden>★</RadioCardSlot>
 *     <RadioCardLabel>Premium</RadioCardLabel>
 *   </RadioCard>
 * </RadioGroup>
 */
export function RadioCardSlot(props: RadioCardSlotProps) {
  const [variantProps, rest] = splitProps(props, radioCardSlot);
  return <ak.Role.span {...radioCardSlot.jsx(variantProps)} {...rest} />;
}

export interface RadioCardContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardContent> {}

/**
 * Wrapper that stacks the card's label and description. Must be nested inside a
 * `RadioCard`.
 * @example
 * <RadioGroup aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardContent>
 *       <RadioCardLabel>Email</RadioCardLabel>
 *       <RadioCardDescription>Use your inbox.</RadioCardDescription>
 *     </RadioCardContent>
 *   </RadioCard>
 * </RadioGroup>
 */
export function RadioCardContent(props: RadioCardContentProps) {
  const [variantProps, rest] = splitProps(props, radioCardContent);
  return <ak.Role.span {...radioCardContent.jsx(variantProps)} {...rest} />;
}

export interface RadioCardLabelRowProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardLabelRow> {}

/**
 * Row that puts the card's label and slots, such as a badge, on one line, so
 * the description takes the full width below them. A slot wraps below the label
 * when the row runs out of room. Must be nested inside a `RadioCardContent`.
 * @example
 * <RadioGroup aria-label="Plan">
 *   <RadioCard value="pro">
 *     <RadioCardContent>
 *       <RadioCardLabelRow>
 *         <RadioCardLabel>Pro</RadioCardLabel>
 *         <RadioCardSlot $kind="box">
 *           <Badge $kind="solid">Popular</Badge>
 *         </RadioCardSlot>
 *       </RadioCardLabelRow>
 *       <RadioCardDescription>For growing teams.</RadioCardDescription>
 *     </RadioCardContent>
 *   </RadioCard>
 * </RadioGroup>
 */
export function RadioCardLabelRow(props: RadioCardLabelRowProps) {
  const [variantProps, rest] = splitProps(props, radioCardLabelRow);
  return <ak.Role.span {...radioCardLabelRow.jsx(variantProps)} {...rest} />;
}

export interface RadioCardLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioCardLabel> {
  /**
   * The label text, rendered when `children` is omitted. Defaults to the text
   * of `children` that are only text and numbers. A checked segment shows its
   * label in a heavier weight only when the label has this text, because the
   * text reserves the heavier width in advance and keeps the segment size. Keep
   * it equal to the visible text of custom `children`.
   */
  text?: string;
}

/**
 * Main text of the card. Must be nested inside a `RadioCard`. Truncates to one
 * line by default; set `$truncate={false}` to let it wrap.
 * @example
 * <RadioGroup aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardLabel>Email</RadioCardLabel>
 *   </RadioCard>
 * </RadioGroup>
 */
export function RadioCardLabel({
  text,
  children = text,
  ...props
}: RadioCardLabelProps) {
  const [variantProps, rest] = splitProps(props, radioCardLabel);
  return (
    <ak.Role.span
      data-text={text ?? getChildrenText(children)}
      {...radioCardLabel.jsx(variantProps)}
      {...rest}
    >
      {children}
    </ak.Role.span>
  );
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
 * <RadioGroup aria-label="Contact method">
 *   <RadioCard value="email">
 *     <RadioCardContent>
 *       <RadioCardLabel>Email</RadioCardLabel>
 *       <RadioCardDescription>Use your inbox.</RadioCardDescription>
 *     </RadioCardContent>
 *   </RadioCard>
 * </RadioGroup>
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
  extends ak.RoleProps<"div">, VariantProps<typeof radioCardGrid> {}

/**
 * Lays out the `RadioCard`s of a `RadioGroup` in a grid of equal rows, with as
 * many columns as `$minItemSize` allows. Its `$gap` spaces the cards, and the
 * `auto` default takes two thirds of the group gap. It adds no role. Must be
 * nested inside a `RadioGroup`.
 * @example
 * <RadioGroup label="Contact method" defaultValue="email">
 *   <RadioCardGrid>
 *     <RadioCard value="email">Email</RadioCard>
 *     <RadioCard value="phone">Phone</RadioCard>
 *   </RadioCardGrid>
 * </RadioGroup>
 */
export function RadioCardGrid(props: RadioCardGridProps) {
  const [variantProps, rest] = splitProps(props, radioCardGrid);
  return <ak.Role.div {...radioCardGrid.jsx(variantProps)} {...rest} />;
}
