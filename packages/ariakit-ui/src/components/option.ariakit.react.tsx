import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { optionLabel, optionSlot } from "../styles/option.ts";
import { wrapsSlotChildren } from "../styles/slot-frame.ts";

export interface OptionLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof optionLabel> {}

/**
 * The main text of an option. Truncates to one line by default; set
 * `$truncate={false}` to let it wrap.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple">
 *     <OptionLabel>Apple</OptionLabel>
 *   </ComboboxItem>
 * </Combobox>
 */
export function OptionLabel(props: OptionLabelProps) {
  const [variantProps, rest] = splitProps(props, optionLabel);
  return <ak.Role.span {...optionLabel.jsx(variantProps)} {...rest} />;
}

export interface OptionSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof optionSlot> {}

/**
 * An icon or other content beside an option label.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple">
 *     <OptionSlot aria-hidden>★</OptionSlot>
 *     <OptionLabel>Apple</OptionLabel>
 *   </ComboboxItem>
 * </Combobox>
 */
export function OptionSlot(props: OptionSlotProps) {
  const [variantProps, rest] = splitProps(props, optionSlot);
  const variants = optionSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...optionSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
