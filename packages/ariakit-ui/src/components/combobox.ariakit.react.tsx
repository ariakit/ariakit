import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { clsx } from "clsx";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import { badge as badgeStyle } from "../styles/badge.ts";
import {
  comboboxEmpty,
  comboboxGroup,
  comboboxGroupLabel,
  comboboxInput,
  comboboxItem,
  comboboxItemContent,
  comboboxItemDescription,
  comboboxItemLabel,
  comboboxItemSlot,
  comboboxSelect,
  comboboxSelectArrow,
  comboboxSelectIcon,
  comboboxSelectItem,
  comboboxSelectItemCheck,
  comboboxSelectPopover,
  comboboxSelectValueLabel,
  comboboxLabel,
  comboboxPopover,
} from "../styles/combobox.ts";

export interface ComboboxProps
  extends
    Omit<ComboboxInputProps, "value" | "defaultValue" | "popover">,
    Pick<
      ComboboxProviderProps,
      "inputValue" | "setInputValue" | "defaultInputValue"
    > {
  /** Custom label element or props to render a `ComboboxLabel`. */
  label?: React.ReactNode | ComboboxLabelProps;
  /** Custom popover element or props to render a `ComboboxPopover`. */
  popover?: React.ReactElement<ComboboxPopoverProps> | ComboboxPopoverProps;
}

/**
 * Wires the provider, input, label, and popover. Children form the suggestion
 * list; filter them using `inputValue` and `setInputValue`.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple" />
 *   <ComboboxItem value="Orange" />
 * </Combobox>
 */
export function Combobox({
  inputValue,
  setInputValue,
  defaultInputValue,
  label,
  popover,
  children,
  store,
  ...props
}: ComboboxProps) {
  const labelElement =
    label != null && label !== false
      ? createRender(ComboboxLabel, label)
      : null;
  const popoverElement = createRender(ComboboxPopover, popover, { children });
  return (
    <ComboboxProvider
      store={store}
      inputValue={inputValue}
      setInputValue={setInputValue}
      defaultInputValue={defaultInputValue}
    >
      {labelElement}
      <ComboboxInput {...props} />
      {popoverElement}
    </ComboboxProvider>
  );
}

export interface ComboboxProviderProps extends ak.ComboboxProviderProps {}

export function ComboboxProvider(props: ComboboxProviderProps) {
  return <ak.ComboboxProvider {...props} />;
}

export interface ComboboxInputProps
  extends ak.ComboboxProps, VariantProps<typeof comboboxInput> {}

export function ComboboxInput(props: ComboboxInputProps) {
  const [variantProps, rest] = splitProps(props, comboboxInput);
  return <ak.Combobox {...comboboxInput.jsx(variantProps)} {...rest} />;
}

export interface ComboboxLabelProps
  extends ak.ComboboxLabelProps, VariantProps<typeof comboboxLabel> {}

export function ComboboxLabel(props: ComboboxLabelProps) {
  const [variantProps, rest] = splitProps(props, comboboxLabel);
  return <ak.ComboboxLabel {...comboboxLabel.jsx(variantProps)} {...rest} />;
}

export interface ComboboxPopoverProps
  extends ak.ComboboxPopoverProps, VariantProps<typeof comboboxPopover> {}

export function ComboboxPopover(props: ComboboxPopoverProps) {
  const [variantProps, rest] = splitProps(props, comboboxPopover);
  return (
    <ak.ComboboxPopover
      portal
      gutter={8}
      {...comboboxPopover.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface ComboboxGroupProps
  extends ak.ComboboxGroupProps, VariantProps<typeof comboboxGroup> {
  /** Custom label element or props to render a `ComboboxGroupLabel`. */
  label?: React.ReactNode | ComboboxGroupLabelProps;
}

export function ComboboxGroup({ label, ...props }: ComboboxGroupProps) {
  const [variantProps, rest] = splitProps(props, comboboxGroup);
  return (
    <ak.ComboboxGroup {...comboboxGroup.jsx(variantProps)} {...rest}>
      {label != null &&
        label !== false &&
        createRender(ComboboxGroupLabel, label)}
      {rest.children}
    </ak.ComboboxGroup>
  );
}

export interface ComboboxGroupLabelProps
  extends ak.ComboboxGroupLabelProps, VariantProps<typeof comboboxGroupLabel> {}

export function ComboboxGroupLabel(props: ComboboxGroupLabelProps) {
  const [variantProps, rest] = splitProps(props, comboboxGroupLabel);
  return (
    <ak.ComboboxGroupLabel
      {...comboboxGroupLabel.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface ComboboxItemProps
  extends ak.ComboboxItemProps, VariantProps<typeof comboboxItem> {}

/**
 * Suggestion row. Custom children can use ComboboxItemSlot,
 * ComboboxItemContent, ComboboxItemLabel, and ComboboxItemDescription to lay
 * out an avatar and secondary text.
 */
export function ComboboxItem(props: ComboboxItemProps) {
  const [variantProps, rest] = splitProps(props, comboboxItem);
  return (
    <ak.ComboboxItem
      focusOnHover
      blurOnHoverEnd={false}
      {...comboboxItem.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
      {...rest}
    >
      {rest.children ?? <ComboboxItemLabel>{rest.value}</ComboboxItemLabel>}
    </ak.ComboboxItem>
  );
}

export interface ComboboxEmptyProps
  extends ak.RoleProps<"div">, VariantProps<typeof comboboxEmpty> {}

/** Render when filtering leaves no suggestions. */
export function ComboboxEmpty(props: ComboboxEmptyProps) {
  const [variantProps, rest] = splitProps(props, comboboxEmpty);
  return (
    <ak.Role.div {...comboboxEmpty.jsx(variantProps)} {...rest}>
      {rest.children ?? "No results found"}
    </ak.Role.div>
  );
}

export interface ComboboxItemContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof comboboxItemContent> {}

export function ComboboxItemContent(props: ComboboxItemContentProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemContent);
  return <ak.Role.span {...comboboxItemContent.jsx(variantProps)} {...rest} />;
}

export interface ComboboxItemDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof comboboxItemDescription> {}

export function ComboboxItemDescription(props: ComboboxItemDescriptionProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemDescription);
  return (
    <ak.Role.span {...comboboxItemDescription.jsx(variantProps)} {...rest} />
  );
}

export interface ComboboxItemLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof comboboxItemLabel> {}

export function ComboboxItemLabel(props: ComboboxItemLabelProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemLabel);
  return <ak.Role.span {...comboboxItemLabel.jsx(variantProps)} {...rest} />;
}

export interface ComboboxItemSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof comboboxItemSlot> {}

export function ComboboxItemSlot(props: ComboboxItemSlotProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemSlot);
  const variants = comboboxItemSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...comboboxItemSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface ComboboxSelectProps extends Omit<
  ComboboxSelectButtonProps,
  "value" | "defaultValue" | "popover"
> {
  value?: ComboboxSelectProviderProps["value"];
  setValue?: ComboboxSelectProviderProps["setValue"];
  defaultValue?: ComboboxSelectProviderProps["defaultValue"];
  /** Items to render in the popover when not provided as children. */
  items?: ComboboxSelectItemProps[];
  /** Custom label element or props to render a `ComboboxSelectLabel`. */
  label?: React.ReactNode | ComboboxSelectLabelProps;
  /** Custom popover element or props to render a `ComboboxSelectPopover`. */
  popover?: React.ReactElement | ComboboxSelectPopoverProps;
}

/**
 * High-level select that wires provider, button, label and popover.
 * @example
 * <ComboboxSelect popover={{ portal: true }}>
 *   <ComboboxSelectItem value="apple" />
 *   <ComboboxSelectItem value="orange" />
 * </ComboboxSelect>
 * @example
 * <ComboboxSelect
 *   label="Fruit"
 *   items={[
 *     { value: "apple" },
 *     { value: "orange" },
 *   ]}
 * />
 */
export function ComboboxSelect({
  value,
  setValue,
  defaultValue,
  items,
  label,
  children,
  popover,
  ...props
}: ComboboxSelectProps) {
  const labelEl =
    label != null && label !== false
      ? createRender(ComboboxSelectLabel, label)
      : null;
  const popoverEl = createRender(ComboboxSelectPopover, popover);
  return (
    <ComboboxSelectProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue}
    >
      {labelEl}
      <ComboboxSelectButton {...props} />
      <ak.Role render={popoverEl}>
        {items?.map((item) => (
          <ComboboxSelectItem key={item.value} {...item} />
        ))}
        {children}
      </ak.Role>
    </ComboboxSelectProvider>
  );
}

export interface ComboboxSelectProviderProps extends Omit<
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
export function ComboboxSelectProvider({
  value,
  setValue,
  defaultValue,
  ...props
}: ComboboxSelectProviderProps) {
  return (
    <ak.ComboboxProvider
      selectedValue={value}
      setSelectedValue={setValue}
      defaultSelectedValue={defaultValue}
      {...props}
    />
  );
}

export interface ComboboxSelectValueProps
  extends ak.ComboboxSelectedValueProps {}

/**
 * @see https://ariakit.com/reference/select-value
 */
export function ComboboxSelectValue(props: ComboboxSelectValueProps) {
  return <ak.ComboboxSelectedValue {...props} />;
}

export interface ComboboxSelectLabelProps extends ak.ComboboxSelectLabelProps {}

/**
 * @see https://ariakit.com/reference/select-label
 */
export function ComboboxSelectLabel(props: ComboboxSelectLabelProps) {
  return <ak.ComboboxSelectLabel {...props} />;
}

export interface ComboboxSelectButtonProps
  extends ak.ComboboxSelectProps, VariantProps<typeof comboboxSelect> {
  /**
   * Custom icon element that will be rendered before or after the display value
   * depending on the `chevron` position.
   */
  icon?: React.ReactNode;
  /** Selects chevron/icon placement (before, after). Set `false` to hide. */
  chevron?: "before" | "after" | false;
  /** Custom display value element. */
  displayValue?: React.ReactNode;
  /**
   * Styles the button as a colored status badge, like the legacy `ak-badge-*`
   * classes on a select button. Pass a colored `$layer` to tint it.
   */
  badge?: boolean;
}

/**
 * @see https://ariakit.com/reference/select
 */
export function ComboboxSelectButton({
  icon,
  chevron = "after",
  displayValue,
  badge,
  ...props
}: ComboboxSelectButtonProps) {
  const [variantProps, rest] = splitProps(props, comboboxSelect);
  // The badge look resolves through the badge cv so the button tracks its
  // defaults when they are tuned; explicit variant props still win.
  const badgeVariants = badge ? badgeStyle.getVariants(variantProps) : null;
  const arrow = chevron !== false && (
    <span {...comboboxSelectArrow.jsx({})}>
      <ChevronDownIcon />
    </span>
  );
  const iconElement = icon != null && (
    <span {...comboboxSelectIcon.jsx({})}>{icon}</span>
  );
  return (
    <ak.ComboboxSelect
      {...comboboxSelect.jsx({
        ...variantProps,
        ...badgeVariants,
        $disabled: variantProps.$disabled ?? rest.disabled,
        // The badge cv's own class; restated because the badge look is composed
        // from resolved variants, which carry no classes.
        className: clsx(badge && "font-medium", variantProps.className),
      })}
      {...rest}
    >
      {chevron === "before" && arrow}
      {chevron !== "before" && iconElement}
      <span {...comboboxSelectValueLabel.jsx({})}>
        {displayValue || rest.children || <ComboboxSelectValue />}
      </span>
      {chevron === "before" && iconElement}
      {chevron === "after" && arrow}
    </ak.ComboboxSelect>
  );
}

export interface ComboboxSelectPopoverProps
  extends ak.ComboboxPopoverProps, VariantProps<typeof comboboxSelectPopover> {}

/**
 * @see https://ariakit.com/reference/select-popover
 */
export function ComboboxSelectPopover(props: ComboboxSelectPopoverProps) {
  const [variantProps, rest] = splitProps(props, comboboxSelectPopover);
  return (
    <ak.ComboboxPopover
      gutter={8}
      shift={-3}
      {...comboboxSelectPopover.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface ComboboxSelectItemProps
  extends ak.ComboboxItemProps, VariantProps<typeof comboboxSelectItem> {
  /**
   * Custom icon element that will be rendered before or after the display value
   * depending on the `checkmark` position.
   */
  icon?: React.ReactNode;
  /** Selects checkmark/icon placement (before, after). Set `false` to hide. */
  checkmark?: "before" | "after" | false;
}

/**
 * @see https://ariakit.com/reference/select-item
 */
export function ComboboxSelectItem({
  icon,
  checkmark = "before",
  ...props
}: ComboboxSelectItemProps) {
  const [variantProps, rest] = splitProps(props, comboboxSelectItem);
  const check = checkmark !== false && (
    <span {...comboboxSelectItemCheck.jsx({})}>
      <CheckIcon />
    </span>
  );
  const iconElement = icon != null && (
    <span {...comboboxSelectIcon.jsx({})}>{icon}</span>
  );
  return (
    <ak.ComboboxItem {...comboboxSelectItem.jsx(variantProps)} {...rest}>
      {checkmark === "before" && check}
      {checkmark !== "before" && iconElement}
      <span {...comboboxSelectValueLabel.jsx({})}>
        {rest.children || rest.value}
      </span>
      {checkmark === "before" && iconElement}
      {checkmark === "after" && check}
    </ak.ComboboxItem>
  );
}
