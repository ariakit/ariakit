import * as ak from "@ariakit/react";
import { mergeProps } from "@ariakit/react-utils";
import { isElement, isFocusable, isPortalEvent } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { MouseEvent } from "react";
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
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    if (isPortalEvent(event)) return;
    // Keep clicks on the field or a nested action at their own target.
    let target = isElement(event.target) ? event.target : null;
    while (target && target !== event.currentTarget) {
      if (isFocusable(target)) return;
      target = target.parentElement;
    }
    const field = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "input, textarea, select",
      ),
    ).find(isFocusable);
    field?.focus();
  };
  return (
    <ak.Role.div
      {...input.jsx(variantProps)}
      {...mergeProps({ onClick }, rest)}
    />
  );
}

export interface InputSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof inputSlot> {}

export function InputSlot(props: InputSlotProps) {
  const [variantProps, rest] = splitProps(props, inputSlot);
  const variants = inputSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...inputSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
