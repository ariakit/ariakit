import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { wrapTextChildren } from "../react-utils/__wrap-text-children.react.tsx";
import { optionLabel, optionSlot } from "../styles/option.ts";

export interface OptionLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof optionLabel> {}

export function OptionLabel(props: OptionLabelProps) {
  const [variantProps, rest] = splitProps(props, optionLabel);
  return <ak.Role.span {...optionLabel.jsx(variantProps)} {...rest} />;
}

export interface OptionSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof optionSlot> {}

export function OptionSlot(props: OptionSlotProps) {
  const [variantProps, rest] = splitProps(props, optionSlot);
  const variants = optionSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...optionSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : variants.$kind === "avatar" ? (
        wrapTextChildren(rest.children)
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
