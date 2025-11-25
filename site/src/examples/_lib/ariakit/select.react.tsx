import * as ak from "@ariakit/react";
import clsx from "clsx";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.ts";

export interface SelectProps
  extends Omit<SelectButtonProps, "value" | "defaultValue" | "popover">,
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

export function SelectProvider(props: SelectProviderProps) {
  return <ak.SelectProvider {...props} />;
}

export interface SelectValueProps extends ak.SelectValueProps {}

export function SelectValue(props: SelectValueProps) {
  return <ak.SelectValue {...props} />;
}

export interface SelectLabelProps extends ak.SelectLabelProps {}

export function SelectLabel(props: SelectLabelProps) {
  return (
    <ak.SelectLabel
      {...props}
      className={clsx("ak-select-label", props.className)}
    />
  );
}

export interface SelectButtonProps extends ak.SelectProps {
  /**
   * Custom icon element that will be rendered before or after the display value
   * depending on the `chevron` position.
   */
  icon?: React.ReactNode;
  /** Selects chevron/icon placement (before, after). Set `false` to hide. */
  chevron?: "before" | "after" | false;
  /** Custom display value element. */
  displayValue?: React.ReactNode;
}

export function SelectButton({
  icon,
  chevron = "after",
  displayValue,
  ...props
}: SelectButtonProps) {
  return (
    <ak.Select
      {...props}
      className={clsx(
        "ak-select",
        chevron === "before" && "before:ak-select-arrow",
        chevron === "after" && "after:ak-select-arrow",
        props.className,
      )}
    >
      {chevron !== "before" && icon}
      <span className="flex-1">
        {displayValue || props.children || <SelectValue />}
      </span>
      {chevron === "before" && icon}
    </ak.Select>
  );
}

export interface SelectPopoverProps extends ak.SelectPopoverProps {}

export function SelectPopover(props: SelectPopoverProps) {
  return (
    <ak.SelectPopover
      gutter={8}
      shift={-3}
      {...props}
      className={clsx(
        "ak-select-popover data-open:ak-select-popover_open not-data-open:ak-select-popover_closed origin-(--popover-transform-origin)",
        props.className,
      )}
    />
  );
}

export interface SelectItemProps extends ak.SelectItemProps {
  /**
   * Custom icon element that will be rendered before or after the display value
   * depending on the `checkmark` position.
   */
  icon?: React.ReactNode;
  /** Selects checkmark/icon placement (before, after). Set `false` to hide. */
  checkmark?: "before" | "after" | false;
}

export function SelectItem({
  icon,
  checkmark = "before",
  ...props
}: SelectItemProps) {
  return (
    <ak.SelectItem
      {...props}
      className={clsx(
        "ak-select-item data-focus-visible:ak-select-item_focus",
        checkmark === "before" && "before:ak-select-item-check",
        checkmark === "after" && "after:ak-select-item-check",
        props.className,
      )}
    >
      {checkmark !== "before" && icon}
      <span className="flex-1">{props.children || props.value}</span>
      {checkmark === "before" && icon}
    </ak.SelectItem>
  );
}
