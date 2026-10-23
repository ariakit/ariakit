import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import {
  DescriptionContext,
  useDescription,
  useLabelDescription,
} from "../react-utils/__description.react.ts";
import {
  checkbox,
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardGrid,
  checkboxCardLabel,
  checkboxCardSlot,
  checkboxContent,
  checkboxDescription,
  checkboxField,
  checkboxLabel,
} from "../styles/checkbox.ts";
import { wrapsSlotChildren } from "../styles/control.ts";

export interface CheckboxProps
  extends ak.CheckboxProps, VariantProps<typeof checkbox> {}

/**
 * Native checkbox drawn by CSS. The checked, mixed and disabled looks come from
 * the input's own state, so it works on its own, inside a `CheckboxField` or in
 * a table cell. `checked="mixed"` draws a dash.
 * @example
 * <label>
 *   <Checkbox defaultChecked />
 *   Email updates
 * </label>
 */
export function Checkbox(props: CheckboxProps) {
  const [variantProps, rest] = splitProps(props, checkbox);
  return <ak.Checkbox {...checkbox.jsx(variantProps)} {...rest} />;
}

export interface CheckboxFieldProps
  extends ak.CheckboxProps, VariantProps<typeof checkboxField> {}

/**
 * Label row holding a `Checkbox` before its children, which it stacks so a
 * `CheckboxDescription` lands under the `CheckboxLabel`. The label text names
 * the checkbox, and the description describes it before any `aria-describedby`
 * passed to the field. Variant props style the row; every other prop reaches
 * the input.
 * @example
 * <CheckboxField name="updates">
 *   <CheckboxLabel>Email updates</CheckboxLabel>
 *   <CheckboxDescription>Receive product news.</CheckboxDescription>
 * </CheckboxField>
 */
export function CheckboxField({ children, ...props }: CheckboxFieldProps) {
  const [variantProps, rest] = splitProps(props, checkboxField);
  const { id, describedBy, context } = useLabelDescription(rest);
  // Labels cannot match :disabled, so mirror the input state.
  return (
    <DescriptionContext.Provider value={context}>
      <label
        htmlFor={id}
        {...checkboxField.jsx({
          ...variantProps,
          $disabled: variantProps.$disabled ?? rest.disabled,
        })}
      >
        <Checkbox {...rest} id={id} aria-describedby={describedBy} />
        <span {...checkboxContent.jsx()}>{children}</span>
      </label>
    </DescriptionContext.Provider>
  );
}

export interface CheckboxLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxLabel> {}

/**
 * Label text of a `CheckboxField`. Must be nested inside a `CheckboxField`.
 * @example
 * <CheckboxField>
 *   <CheckboxLabel>Email updates</CheckboxLabel>
 * </CheckboxField>
 */
export function CheckboxLabel(props: CheckboxLabelProps) {
  const [variantProps, rest] = splitProps(props, checkboxLabel);
  return <ak.Role.span {...checkboxLabel.jsx(variantProps)} {...rest} />;
}

export interface CheckboxDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxDescription> {}

/**
 * Secondary text below a `CheckboxField` label. The checkbox takes it as its
 * accessible description, so it stays out of the checkbox's name. A field takes
 * one description; put more secondary text in the same description. A
 * description with its own `id` describes the checkbox only after hydration.
 * The description is hidden from assistive technologies while it describes, so
 * keep links and other interactive content outside the field. Must be nested
 * inside a `CheckboxField`.
 * @example
 * <CheckboxField>
 *   <CheckboxLabel>Email updates</CheckboxLabel>
 *   <CheckboxDescription>Receive product news.</CheckboxDescription>
 * </CheckboxField>
 */
export function CheckboxDescription(props: CheckboxDescriptionProps) {
  const [variantProps, rest] = splitProps(props, checkboxDescription);
  const { id, describes } = useDescription(rest.id);
  // A hidden element still describes the input that references it.
  return (
    <ak.Role.span
      aria-hidden={describes || undefined}
      {...checkboxDescription.jsx(variantProps)}
      {...rest}
      id={id}
    />
  );
}

export interface CheckboxCardProps
  extends ak.CheckboxProps, VariantProps<typeof checkboxCard> {}

/**
 * Card-like label wrapping an Ariakit Checkbox kept out of sight, styled from
 * the input's checked, mixed and disabled state. The card's content names the
 * checkbox, and a `CheckboxCardDescription` describes it before any
 * `aria-describedby` passed to the card.
 * @example
 * <CheckboxCard name="updates">
 *   <CheckboxCardCheck />
 *   <CheckboxCardLabel>Email updates</CheckboxCardLabel>
 * </CheckboxCard>
 */
export function CheckboxCard({ children, ...props }: CheckboxCardProps) {
  const [variantProps, rest] = splitProps(props, checkboxCard);
  const { id, describedBy, context } = useLabelDescription(rest);
  // Labels cannot match :disabled, so mirror the input state.
  return (
    <DescriptionContext.Provider value={context}>
      <label
        htmlFor={id}
        {...checkboxCard.jsx({
          ...variantProps,
          $disabled: variantProps.$disabled ?? rest.disabled,
        })}
      >
        <ak.Checkbox {...rest} id={id} aria-describedby={describedBy} />
        {children}
      </label>
    </DescriptionContext.Provider>
  );
}

export interface CheckboxCardCheckProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardCheck> {}

/**
 * The drawn check of a card, reflecting the input's state. Pass a child element
 * to replace the drawn mark. Must be nested inside a `CheckboxCard`.
 * @example
 * <CheckboxCard defaultChecked>
 *   <CheckboxCardCheck />
 *   <CheckboxCardLabel>Email updates</CheckboxCardLabel>
 * </CheckboxCard>
 */
export function CheckboxCardCheck(props: CheckboxCardCheckProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardCheck);
  // Decorative: the input announces the state.
  return (
    <ak.Role.span
      aria-hidden
      {...checkboxCardCheck.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface CheckboxCardSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardSlot> {}

/**
 * Slot for icons or other adornments. Must be nested inside a `CheckboxCard`.
 * @example
 * <CheckboxCard>
 *   <CheckboxCardSlot aria-hidden>★</CheckboxCardSlot>
 *   <CheckboxCardLabel>Featured updates</CheckboxCardLabel>
 * </CheckboxCard>
 */
export function CheckboxCardSlot(props: CheckboxCardSlotProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardSlot);
  const variants = checkboxCardSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...checkboxCardSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface CheckboxCardContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardContent> {}

/**
 * Wrapper that stacks the card's label and description. Must be nested inside a
 * `CheckboxCard`.
 * @example
 * <CheckboxCard>
 *   <CheckboxCardContent>
 *     <CheckboxCardLabel>Email updates</CheckboxCardLabel>
 *     <CheckboxCardDescription>Receive product news.</CheckboxCardDescription>
 *   </CheckboxCardContent>
 * </CheckboxCard>
 */
export function CheckboxCardContent(props: CheckboxCardContentProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardContent);
  return <ak.Role.span {...checkboxCardContent.jsx(variantProps)} {...rest} />;
}

export interface CheckboxCardLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardLabel> {}

/**
 * Main text of the card. Must be nested inside a `CheckboxCard`. Truncates to
 * one line by default; set `$truncate={false}` to let it wrap.
 * @example
 * <CheckboxCard>
 *   <CheckboxCardLabel>Email updates</CheckboxCardLabel>
 * </CheckboxCard>
 */
export function CheckboxCardLabel(props: CheckboxCardLabelProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardLabel);
  return <ak.Role.span {...checkboxCardLabel.jsx(variantProps)} {...rest} />;
}

export interface CheckboxCardDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof checkboxCardDescription> {}

/**
 * Secondary text below the label. The checkbox takes it as its accessible
 * description, so it stays out of the checkbox's name. A card takes one
 * description, and a description with its own `id` describes the checkbox only
 * after hydration. It is hidden from assistive technologies while it describes,
 * so keep interactive content out of it. Must be nested inside a
 * `CheckboxCard`. Truncates to one line by default; set `$truncate={false}` to
 * let it wrap.
 * @example
 * <CheckboxCard>
 *   <CheckboxCardContent>
 *     <CheckboxCardLabel>Email updates</CheckboxCardLabel>
 *     <CheckboxCardDescription>Receive product news.</CheckboxCardDescription>
 *   </CheckboxCardContent>
 * </CheckboxCard>
 */
export function CheckboxCardDescription(props: CheckboxCardDescriptionProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardDescription);
  const { id, describes } = useDescription(rest.id);
  // A hidden element still describes the input that references it.
  return (
    <ak.Role.span
      aria-hidden={describes || undefined}
      {...checkboxCardDescription.jsx(variantProps)}
      {...rest}
      id={id}
    />
  );
}

export interface CheckboxCardGridProps
  extends ak.RoleProps<"div">, VariantProps<typeof checkboxCardGrid> {}

/**
 * Packs `CheckboxCard`s into equal rows, as many columns as `$minItemSize`
 * allows. It renders a group, like the radio group of `RadioCardGrid`, so name
 * it with `aria-label` or `aria-labelledby`.
 * @example
 * <CheckboxCardGrid aria-label="Notifications">
 *   <CheckboxCard value="email">Email</CheckboxCard>
 *   <CheckboxCard value="sms">Text message</CheckboxCard>
 * </CheckboxCardGrid>
 */
export function CheckboxCardGrid(props: CheckboxCardGridProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardGrid);
  return (
    <ak.Role.div
      {...checkboxCardGrid.jsx(variantProps)}
      {...rest}
      // Preserve the group role when the caller passes undefined.
      role={rest.role ?? "group"}
    />
  );
}
