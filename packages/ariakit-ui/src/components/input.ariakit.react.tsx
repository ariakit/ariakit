import * as ak from "@ariakit/react";
import { mergeProps } from "@ariakit/react-utils";
import {
  getWindow,
  isElement,
  isFocusable,
  isPortalEvent,
} from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { MouseEvent } from "react";
import { useRef } from "react";
import { wrapsSlotChildren } from "../styles/control.ts";
import {
  input,
  inputDescription,
  inputError,
  inputField,
  inputFieldContent,
  inputFieldGrid,
  inputLabel,
  inputSlot,
} from "../styles/input.ts";

export interface InputProps
  extends
    ak.FocusableProps<"input">,
    Omit<VariantProps<typeof input>, "$disabled"> {}

/**
 * A text field with shared control styles.
 * @example
 * <label>
 *   Email
 *   <Input type="email" name="email" />
 * </label>
 */
export function Input({ render, ...props }: InputProps) {
  const [variantProps, rest] = splitProps(props, input);
  return (
    <ak.Focusable
      render={render ?? <input />}
      {...input.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface InputGroupProps
  extends ak.RoleProps<"div">, Omit<VariantProps<typeof input>, "$disabled"> {}

/**
 * Groups a field and its slots in one surface. Surface clicks focus the field;
 * nested controls keep their own focus.
 * @example
 * <InputGroup>
 *   <InputSlot aria-hidden>$</InputSlot>
 *   <Input aria-label="Amount in dollars" type="number" />
 * </InputGroup>
 */
export function InputGroup(props: InputGroupProps) {
  const [variantProps, rest] = splitProps(props, input);
  const mouseDownRef = useRef<[number, number] | null>(null);
  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (isPortalEvent(event)) return;
    mouseDownRef.current = [event.clientX, event.clientY];
  };
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const mouseDown = mouseDownRef.current;
    mouseDownRef.current = null;
    if (event.defaultPrevented) return;
    if (isPortalEvent(event)) return;
    // Preserve drag selection. A stationary click can still hold the previous
    // selection until its default action runs, so selection alone is not
    // enough.
    const selection = getWindow(event.currentTarget).getSelection();
    if (selection && !selection.isCollapsed) {
      // Repeated clicks select words or lines without pointer movement.
      if (event.detail > 1) return;
      if (!mouseDown) return;
      if (event.clientX !== mouseDown[0]) return;
      if (event.clientY !== mouseDown[1]) return;
    }
    // Keep clicks on the field or a nested action at their own target.
    let target = isElement(event.target) ? event.target : null;
    while (target && target !== event.currentTarget) {
      if (isFocusable(target)) return;
      target = target.parentElement;
    }
    const field = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"], [type="button"], [type="submit"], [type="reset"], [type="image"], [type="checkbox"], [type="radio"]), textarea, select',
      ),
    ).find(isFocusable);
    field?.focus();
  };
  // oxlint-disable-next-line react/refs -- mergeProps wraps handlers without calling them.
  const mergedProps = mergeProps({ onMouseDown, onClick }, rest);
  return <ak.Role.div {...input.jsx(variantProps)} {...mergedProps} />;
}

export interface InputSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof inputSlot> {}

/**
 * An icon or other content beside a field in an `InputGroup`.
 * @example
 * <InputGroup>
 *   <InputSlot aria-hidden>$</InputSlot>
 *   <Input aria-label="Amount in dollars" type="number" />
 * </InputGroup>
 */
export function InputSlot(props: InputSlotProps) {
  const [variantProps, rest] = splitProps(props, inputSlot);
  const variants = inputSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...inputSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface InputFieldProps
  extends ak.RoleProps<"div">, VariantProps<typeof inputField> {}

/**
 * Stacks a label above an input and the input's error and hints, or puts the
 * label in a start column with `$orientation="horizontal"`. The parts only add
 * styles, so connect them with `htmlFor` and `aria-describedby`.
 * @example
 * <InputField>
 *   <InputLabel htmlFor="email">Email</InputLabel>
 *   <Input id="email" type="email" aria-describedby="email-hint" />
 *   <InputDescription id="email-hint">We never share it.</InputDescription>
 * </InputField>
 */
export function InputField(props: InputFieldProps) {
  const [variantProps, rest] = splitProps(props, inputField);
  return <ak.Role.div {...inputField.jsx(variantProps)} {...rest} />;
}

export interface InputFieldContentProps
  extends ak.RoleProps<"div">, VariantProps<typeof inputFieldContent> {}

/**
 * Holds the input and its texts in the second column of a horizontal
 * `InputField`.
 * @example
 * <InputField $orientation="horizontal">
 *   <InputLabel htmlFor="name">Name</InputLabel>
 *   <InputFieldContent>
 *     <Input id="name" aria-describedby="name-hint" />
 *     <InputDescription id="name-hint">Shown on your profile.</InputDescription>
 *   </InputFieldContent>
 * </InputField>
 */
export function InputFieldContent(props: InputFieldContentProps) {
  const [variantProps, rest] = splitProps(props, inputFieldContent);
  return <ak.Role.div {...inputFieldContent.jsx(variantProps)} {...rest} />;
}

export interface InputFieldGridProps
  extends ak.RoleProps<"div">, VariantProps<typeof inputFieldGrid> {}

/**
 * Lines up horizontal fields, so their labels share a column that fits the
 * longest label. The fields stack when the grid gets narrow.
 * @example
 * <InputFieldGrid>
 *   <InputField $orientation="horizontal">
 *     <InputLabel htmlFor="name">Name</InputLabel>
 *     <InputFieldContent>
 *       <Input id="name" />
 *     </InputFieldContent>
 *   </InputField>
 *   <InputField $orientation="horizontal">
 *     <InputLabel htmlFor="email">Email address</InputLabel>
 *     <InputFieldContent>
 *       <Input id="email" type="email" />
 *     </InputFieldContent>
 *   </InputField>
 * </InputFieldGrid>
 */
export function InputFieldGrid(props: InputFieldGridProps) {
  const [variantProps, rest] = splitProps(props, inputFieldGrid);
  return <ak.Role.div {...inputFieldGrid.jsx(variantProps)} {...rest} />;
}

export interface InputLabelProps
  extends ak.RoleProps<"label">, VariantProps<typeof inputLabel> {}

/**
 * A visible label for an input in an `InputField`. Point `htmlFor` at the
 * input's `id`.
 * @example
 * <InputField>
 *   <InputLabel htmlFor="email">Email</InputLabel>
 *   <Input id="email" type="email" />
 * </InputField>
 */
export function InputLabel(props: InputLabelProps) {
  const [variantProps, rest] = splitProps(props, inputLabel);
  return <ak.Role.label {...inputLabel.jsx(variantProps)} {...rest} />;
}

export interface InputDescriptionProps
  extends ak.RoleProps<"div">, VariantProps<typeof inputDescription> {}

/**
 * Hint text for an input in an `InputField`. List its `id` in the input's
 * `aria-describedby`.
 * @example
 * <InputField>
 *   <InputLabel htmlFor="email">Email</InputLabel>
 *   <Input id="email" type="email" aria-describedby="email-hint" />
 *   <InputDescription id="email-hint">We never share it.</InputDescription>
 * </InputField>
 */
export function InputDescription(props: InputDescriptionProps) {
  const [variantProps, rest] = splitProps(props, inputDescription);
  return <ak.Role.div {...inputDescription.jsx(variantProps)} {...rest} />;
}

export interface InputErrorProps
  extends ak.RoleProps<"div">, VariantProps<typeof inputError> {}

/**
 * Error text for an input in an `InputField`. While it shows, list its `id`
 * first in the input's `aria-describedby` and set `aria-invalid` on the input.
 * It has no live region role; add `role="alert"` when the error appears without
 * a focus change.
 * @example
 * <InputField>
 *   <InputLabel htmlFor="email">Email</InputLabel>
 *   <Input id="email" aria-invalid aria-describedby="email-error" />
 *   <InputError id="email-error">Enter an email address.</InputError>
 * </InputField>
 */
export function InputError(props: InputErrorProps) {
  const [variantProps, rest] = splitProps(props, inputError);
  return <ak.Role.div {...inputError.jsx(variantProps)} {...rest} />;
}
