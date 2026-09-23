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
import { input, inputSlot } from "../styles/input.ts";

export interface InputProps
  extends
    ak.FocusableProps<"input">,
    Omit<VariantProps<typeof input>, "$disabled"> {}

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
