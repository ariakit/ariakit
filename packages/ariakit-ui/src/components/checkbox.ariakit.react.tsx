import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import {
  checkbox,
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardGrid,
  checkboxCardLabel,
  checkboxCardShortcut,
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
 * `CheckboxDescription` lands under the `CheckboxLabel`. Variant props style
 * the row; every other prop reaches the input.
 * @example
 * <CheckboxField name="updates">
 *   <CheckboxLabel>Email updates</CheckboxLabel>
 *   <CheckboxDescription>Receive product news.</CheckboxDescription>
 * </CheckboxField>
 */
export function CheckboxField({ children, ...props }: CheckboxFieldProps) {
  const [variantProps, rest] = splitProps(props, checkboxField);
  // Labels cannot match :disabled, so mirror the input state.
  return (
    <label
      {...checkboxField.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
    >
      <Checkbox {...rest} />
      <span {...checkboxContent.jsx()}>{children}</span>
    </label>
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
 * Secondary text below a `CheckboxField` label. Must be nested inside a
 * `CheckboxField`.
 * @example
 * <CheckboxField>
 *   <CheckboxLabel>Email updates</CheckboxLabel>
 *   <CheckboxDescription>Receive product news.</CheckboxDescription>
 * </CheckboxField>
 */
export function CheckboxDescription(props: CheckboxDescriptionProps) {
  const [variantProps, rest] = splitProps(props, checkboxDescription);
  return <ak.Role.span {...checkboxDescription.jsx(variantProps)} {...rest} />;
}

export interface CheckboxCardProps
  extends ak.CheckboxProps, VariantProps<typeof checkboxCard> {}

/**
 * Card-like label wrapping an Ariakit Checkbox kept out of sight, styled from
 * the input's checked, mixed and disabled state.
 * @example
 * <CheckboxCard name="updates">
 *   <CheckboxCardCheck />
 *   <CheckboxCardLabel>Email updates</CheckboxCardLabel>
 * </CheckboxCard>
 */
export function CheckboxCard({ children, ...props }: CheckboxCardProps) {
  const [variantProps, rest] = splitProps(props, checkboxCard);
  // Labels cannot match :disabled, so mirror the input state.
  return (
    <label
      {...checkboxCard.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
    >
      <ak.Checkbox {...rest} />
      {children}
    </label>
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

export interface CheckboxCardShortcutProps
  extends ak.RoleProps<"kbd">, VariantProps<typeof checkboxCardShortcut> {}

/**
 * A keyboard shortcut beside a checkbox card label. Renders a `kbd` element, so
 * pass the shortcut text, or nested `kbd` elements for the keys of a chord.
 * @example
 * <CheckboxCard>
 *   <CheckboxCardLabel>Bold</CheckboxCardLabel>
 *   <CheckboxCardShortcut>⌘B</CheckboxCardShortcut>
 * </CheckboxCard>
 */
export function CheckboxCardShortcut(props: CheckboxCardShortcutProps) {
  const [variantProps, rest] = splitProps(props, checkboxCardShortcut);
  return (
    <ak.Role.kbd {...checkboxCardShortcut.jsx(variantProps)} {...rest}>
      <span>{rest.children}</span>
    </ak.Role.kbd>
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
 * Secondary text below the label. Must be nested inside a `CheckboxCard`.
 * Truncates to one line by default; set `$truncate={false}` to let it wrap.
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
  return (
    <ak.Role.span {...checkboxCardDescription.jsx(variantProps)} {...rest} />
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
