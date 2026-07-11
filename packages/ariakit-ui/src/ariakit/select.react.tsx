import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.ts";
import {
  select,
  selectArrow,
  selectItem,
  selectItemCheck,
  selectPopover,
} from "../styles/select.ts";

export interface SelectProps
  extends
    Omit<SelectButtonProps, "value" | "defaultValue" | "popover">,
    Pick<SelectProviderProps, "value" | "setValue" | "defaultValue"> {
  /** Items to render in the popover when not provided as children. */
  items?: SelectItemProps[];
  /** Custom label element or props to render a `SelectLabel`. */
  label?: React.ReactNode | SelectLabelProps;
  /** Custom popover element or props to render a `SelectPopover`. */
  popover?: React.ReactElement | SelectPopoverProps;
}

/**
 * High-level select that wires provider, button, label and popover.
 * @example
 * <Select popover={{ portal: true }}>
 *   <SelectItem value="apple" />
 *   <SelectItem value="orange" />
 * </Select>
 * @example
 * <Select
 *   label="Fruit"
 *   items={[
 *     { value: "apple" },
 *     { value: "orange" },
 *   ]}
 * />
 */
export function Select({
  value,
  setValue,
  defaultValue,
  items,
  label,
  children,
  popover,
  ...props
}: SelectProps) {
  const labelEl = label != null ? createRender(SelectLabel, label) : null;
  const popoverEl = createRender(SelectPopover, popover);
  return (
    <SelectProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue}
    >
      {labelEl}
      <SelectButton {...props} />
      <ak.Role render={popoverEl}>
        {items?.map((item) => (
          <SelectItem key={item.value} {...item} />
        ))}
        {children}
      </ak.Role>
    </SelectProvider>
  );
}

export interface SelectProviderProps extends ak.SelectProviderProps {}

/**
 * @see https://ariakit.com/reference/select-provider
 */
export function SelectProvider(props: SelectProviderProps) {
  return <ak.SelectProvider {...props} />;
}

export interface SelectValueProps extends ak.SelectValueProps {}

/**
 * @see https://ariakit.com/reference/select-value
 */
export function SelectValue(props: SelectValueProps) {
  return <ak.SelectValue {...props} />;
}

export interface SelectLabelProps extends ak.SelectLabelProps {}

/**
 * @see https://ariakit.com/reference/select-label
 */
export function SelectLabel(props: SelectLabelProps) {
  return <ak.SelectLabel {...props} />;
}

export interface SelectButtonProps
  extends ak.SelectProps, VariantProps<typeof select> {
  /**
   * Custom icon element that will be rendered before or after the display
   * value depending on the `chevron` position.
   */
  icon?: React.ReactNode;
  /** Selects chevron/icon placement (before, after). Set `false` to hide. */
  chevron?: "before" | "after" | false;
  /** Custom display value element. */
  displayValue?: React.ReactNode;
}

/**
 * @see https://ariakit.com/reference/select
 */
export function SelectButton({
  icon,
  chevron = "after",
  displayValue,
  ...props
}: SelectButtonProps) {
  const [variantProps, rest] = splitProps(props, select);
  const arrow = chevron !== false && (
    <span {...selectArrow.jsx({})}>
      <ChevronDownIcon />
    </span>
  );
  return (
    <ak.Select
      {...select.jsx({ $disabled: rest.disabled, ...variantProps })}
      {...rest}
    >
      {chevron === "before" && arrow}
      {chevron !== "before" && icon}
      <span className="flex-1 text-start">
        {displayValue || rest.children || <SelectValue />}
      </span>
      {chevron === "before" && icon}
      {chevron === "after" && arrow}
    </ak.Select>
  );
}

export interface SelectPopoverProps
  extends ak.SelectPopoverProps, VariantProps<typeof selectPopover> {}

/**
 * @see https://ariakit.com/reference/select-popover
 */
export function SelectPopover(props: SelectPopoverProps) {
  const [variantProps, rest] = splitProps(props, selectPopover);
  // Ariakit signals the open state through data-open; an explicit $state
  // prop still wins.
  return (
    <ak.SelectPopover
      gutter={8}
      shift={-3}
      {...selectPopover.jsx({ $state: "data", ...variantProps })}
      {...rest}
    />
  );
}

export interface SelectItemProps
  extends ak.SelectItemProps, VariantProps<typeof selectItem> {
  /**
   * Custom icon element that will be rendered before or after the display
   * value depending on the `checkmark` position.
   */
  icon?: React.ReactNode;
  /** Selects checkmark/icon placement (before, after). Set `false` to hide. */
  checkmark?: "before" | "after" | false;
}

/**
 * @see https://ariakit.com/reference/select-item
 */
export function SelectItem({
  icon,
  checkmark = "before",
  ...props
}: SelectItemProps) {
  const [variantProps, rest] = splitProps(props, selectItem);
  const check = checkmark !== false && (
    <span {...selectItemCheck.jsx({})}>
      <CheckIcon />
    </span>
  );
  return (
    <ak.SelectItem {...selectItem.jsx(variantProps)} {...rest}>
      {checkmark === "before" && check}
      {checkmark !== "before" && icon}
      <span className="flex-1">{rest.children || rest.value}</span>
      {checkmark === "before" && icon}
      {checkmark === "after" && check}
    </ak.SelectItem>
  );
}
