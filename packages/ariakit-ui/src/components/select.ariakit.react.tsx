import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { clsx } from "clsx";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import { badge as badgeStyle } from "../styles/badge.ts";
import {
  select,
  selectArrow,
  selectIcon,
  selectItem,
  selectItemCheck,
  selectPopover,
  selectValueLabel,
} from "../styles/select.ts";

export interface SelectProps extends Omit<
  SelectButtonProps,
  "value" | "defaultValue" | "popover"
> {
  value?: SelectProviderProps["value"];
  setValue?: SelectProviderProps["setValue"];
  defaultValue?: SelectProviderProps["defaultValue"];
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

export interface SelectProviderProps extends Omit<
  ak.ComboboxProviderProps,
  | "value"
  | "setValue"
  | "defaultValue"
  | "selectedValue"
  | "setSelectedValue"
  | "defaultSelectedValue"
> {
  value?: ak.ComboboxProviderProps["selectedValue"];
  setValue?: ak.ComboboxProviderProps["setSelectedValue"];
  defaultValue?: ak.ComboboxProviderProps["defaultSelectedValue"];
}

/**
 * @see https://ariakit.com/reference/select-provider
 */
export function SelectProvider({
  value,
  setValue,
  defaultValue,
  ...props
}: SelectProviderProps) {
  return (
    <ak.ComboboxProvider
      selectedValue={value}
      setSelectedValue={setValue}
      defaultSelectedValue={defaultValue}
      {...props}
    />
  );
}

export interface SelectValueProps extends ak.ComboboxSelectedValueProps {}

/**
 * @see https://ariakit.com/reference/select-value
 */
export function SelectValue(props: SelectValueProps) {
  return <ak.ComboboxSelectedValue {...props} />;
}

export interface SelectLabelProps extends ak.ComboboxSelectLabelProps {}

/**
 * @see https://ariakit.com/reference/select-label
 */
export function SelectLabel(props: SelectLabelProps) {
  return <ak.ComboboxSelectLabel {...props} />;
}

export interface SelectButtonProps
  extends ak.ComboboxSelectProps, VariantProps<typeof select> {
  /**
   * Custom icon element that will be rendered before or after the display
   * value depending on the `chevron` position.
   */
  icon?: React.ReactNode;
  /** Selects chevron/icon placement (before, after). Set `false` to hide. */
  chevron?: "before" | "after" | false;
  /** Custom display value element. */
  displayValue?: React.ReactNode;
  /**
   * Styles the button as a colored status badge, like the legacy
   * `ak-badge-*` classes on a select button. Pass a colored `$layer` to
   * tint it.
   */
  badge?: boolean;
}

/**
 * @see https://ariakit.com/reference/select
 */
export function SelectButton({
  icon,
  chevron = "after",
  displayValue,
  badge,
  ...props
}: SelectButtonProps) {
  const [variantProps, rest] = splitProps(props, select);
  // The badge look resolves through the badge cv so the button tracks its
  // defaults when they are tuned; explicit variant props still win.
  const badgeVariants = badge ? badgeStyle.getVariants(variantProps) : null;
  const arrow = chevron !== false && (
    <span {...selectArrow.jsx({})}>
      <ChevronDownIcon />
    </span>
  );
  const iconElement = icon != null && (
    <span {...selectIcon.jsx({})}>{icon}</span>
  );
  return (
    <ak.ComboboxSelect
      {...select.jsx({
        ...badgeVariants,
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
        // The badge cv's own class; restated because the badge look is
        // composed from resolved variants, which carry no classes.
        className: clsx(badge && "font-medium", variantProps.className),
      })}
      {...rest}
    >
      {chevron === "before" && arrow}
      {chevron !== "before" && iconElement}
      <span {...selectValueLabel.jsx({})}>
        {displayValue || rest.children || <SelectValue />}
      </span>
      {chevron === "before" && iconElement}
      {chevron === "after" && arrow}
    </ak.ComboboxSelect>
  );
}

export interface SelectPopoverProps
  extends ak.ComboboxPopoverProps, VariantProps<typeof selectPopover> {}

/**
 * @see https://ariakit.com/reference/select-popover
 */
export function SelectPopover(props: SelectPopoverProps) {
  const [variantProps, rest] = splitProps(props, selectPopover);
  // Ariakit signals the open state through data-open; an explicit $state
  // prop still wins.
  return (
    <ak.ComboboxPopover
      gutter={8}
      shift={-3}
      {...selectPopover.jsx({
        ...variantProps,
        $state: variantProps.$state ?? "data",
      })}
      {...rest}
    />
  );
}

export interface SelectItemProps
  extends ak.ComboboxItemProps, VariantProps<typeof selectItem> {
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
    <ak.ComboboxItem {...selectItem.jsx(variantProps)} {...rest}>
      {checkmark === "before" && check}
      {checkmark !== "before" && icon}
      <span {...selectValueLabel.jsx({})}>{rest.children || rest.value}</span>
      {checkmark === "before" && icon}
      {checkmark === "after" && check}
    </ak.ComboboxItem>
  );
}
