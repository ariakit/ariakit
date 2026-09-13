import * as ak from "@ariakit/react";
import { mergeProps } from "@ariakit/react-utils";
import { isElement, isFocusable } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { MouseEvent } from "react";
import { input, inputSlot } from "../styles/input.ts";

export interface InputProps
  extends ak.FocusableProps<"input">, VariantProps<typeof input> {}

export function Input({ children, focusable, render, ...props }: InputProps) {
  const [variantProps, rest] = splitProps(props, input);
  const hasChildren = children != null && children !== false;
  if (hasChildren && !focusable) {
    const onClick = (event: MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
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
      <ak.Role
        render={render ?? <div />}
        {...input.jsx(variantProps)}
        {...mergeProps({ onClick }, rest)}
      >
        {children}
      </ak.Role>
    );
  }
  return (
    <ak.Focusable
      render={render ?? <input />}
      focusable={focusable}
      {...input.jsx(variantProps)}
      {...rest}
    >
      {children}
    </ak.Focusable>
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
