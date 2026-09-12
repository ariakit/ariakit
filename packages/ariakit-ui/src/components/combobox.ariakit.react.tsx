import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import type * as React from "react";
import {
  createOptionalRender,
  createRender,
  isRenderable,
} from "../react-utils/create-render.react.ts";
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
  comboboxItemCheck,
  comboboxList,
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
  const labelElement = createOptionalRender(ComboboxLabel, label);
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

export function ComboboxPopover({
  portal = true,
  gutter = 8,
  ...props
}: ComboboxPopoverProps) {
  const [variantProps, rest] = splitProps(props, comboboxPopover);
  return (
    <ak.ComboboxPopover
      portal={portal}
      gutter={gutter}
      {...comboboxPopover.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface ComboboxListProps
  extends ak.ComboboxListProps, VariantProps<typeof comboboxList> {}

/** A list that scrolls separately from an input in the popover. */
export function ComboboxList(props: ComboboxListProps) {
  const [variantProps, rest] = splitProps(props, comboboxList);
  return <ak.ComboboxList {...comboboxList.jsx(variantProps)} {...rest} />;
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
      {createOptionalRender(ComboboxGroupLabel, label)}
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
  extends ak.ComboboxItemProps, VariantProps<typeof comboboxItem> {
  /** Icon beside the label, opposite the checkmark when one is shown. */
  icon?: React.ReactNode;
  /** Shows a selection checkmark before or after the label. */
  checkmark?: "before" | "after" | false;
}

/**
 * Suggestion row. Custom children can use ComboboxItemSlot,
 * ComboboxItemContent, ComboboxItemLabel, and ComboboxItemDescription to lay
 * out an avatar and secondary text.
 */
export function ComboboxItem({
  icon,
  checkmark = false,
  focusOnHover = true,
  blurOnHoverEnd = false,
  ...props
}: ComboboxItemProps) {
  const [variantProps, rest] = splitProps(props, comboboxItem);
  const check = checkmark !== false && <ComboboxItemCheck />;
  const iconElement = isRenderable(icon) && (
    <ComboboxItemSlot>{icon}</ComboboxItemSlot>
  );
  const content = isRenderable(rest.children) ? rest.children : rest.value;
  return (
    <ak.ComboboxItem
      focusOnHover={focusOnHover}
      blurOnHoverEnd={blurOnHoverEnd}
      {...comboboxItem.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
      {...rest}
    >
      {checkmark === "before" && check}
      {checkmark !== "before" && iconElement}
      {typeof content === "string" || typeof content === "number" ? (
        <ComboboxItemLabel className="flex-1">{content}</ComboboxItemLabel>
      ) : (
        content
      )}
      {checkmark === "before" && iconElement}
      {checkmark === "after" && check}
    </ak.ComboboxItem>
  );
}

export interface ComboboxItemCheckProps
  extends ak.ComboboxItemCheckProps, VariantProps<typeof comboboxItemCheck> {}

/** Keeps its space when unselected so the item labels stay aligned. */
export function ComboboxItemCheck({
  checked,
  store: _store,
  "aria-hidden": ariaHidden = true,
  ...props
}: ComboboxItemCheckProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemCheck);
  return (
    <ak.ComboboxItemSelected>
      {(selected) => (
        <ak.Role.span
          aria-hidden={ariaHidden}
          {...comboboxItemCheck.jsx(variantProps)}
          {...rest}
        >
          {(checked ?? selected) ? rest.children || <CheckIcon /> : null}
        </ak.Role.span>
      )}
    </ak.ComboboxItemSelected>
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

export interface ComboboxSelectedValueProps
  extends ak.ComboboxSelectedValueProps {}

// A multiple select stores an array. Ariakit returns it as is, and React would
// run the strings together, so the default display joins them.
function joinSelectedValue(value: string | readonly string[]) {
  if (typeof value === "string") {
    return value;
  }
  return value.join(", ");
}

/**
 * Renders the selected value. When several items are selected, it joins their
 * values with a comma. Pass a function as children to render them differently.
 * @see https://ariakit.com/reference/combobox-selected-value
 */
export function ComboboxSelectedValue({
  children = joinSelectedValue,
  ...props
}: ComboboxSelectedValueProps) {
  return (
    <ak.ComboboxSelectedValue {...props}>{children}</ak.ComboboxSelectedValue>
  );
}

export interface ComboboxSelectLabelProps extends ak.ComboboxSelectLabelProps {}

/**
 * @see https://ariakit.com/reference/combobox-select-label
 */
export function ComboboxSelectLabel(props: ComboboxSelectLabelProps) {
  return <ak.ComboboxSelectLabel {...props} />;
}

export interface ComboboxSelectProps
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
}

/**
 * @see https://ariakit.com/reference/combobox-select
 */
export function ComboboxSelect({
  icon,
  chevron = "after",
  displayValue,
  ...props
}: ComboboxSelectProps) {
  const [variantProps, rest] = splitProps(props, comboboxSelect);
  const arrow = chevron !== false && <ComboboxSelectArrow />;
  const iconElement = isRenderable(icon) && (
    <ComboboxItemSlot>{icon}</ComboboxItemSlot>
  );
  return (
    <ak.ComboboxSelect
      {...comboboxSelect.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
      {...rest}
    >
      {chevron === "before" && arrow}
      {chevron !== "before" && iconElement}
      <ComboboxItemLabel className="flex-1 text-start">
        {isRenderable(displayValue) ? (
          displayValue
        ) : isRenderable(rest.children) ? (
          rest.children
        ) : (
          <ComboboxSelectedValue />
        )}
      </ComboboxItemLabel>
      {chevron === "before" && iconElement}
      {chevron === "after" && arrow}
    </ak.ComboboxSelect>
  );
}

export interface ComboboxSelectArrowProps
  extends
    ak.ComboboxSelectArrowProps,
    VariantProps<typeof comboboxSelectArrow> {}

export function ComboboxSelectArrow(props: ComboboxSelectArrowProps) {
  const [variantProps, rest] = splitProps(props, comboboxSelectArrow);
  const styleProps = comboboxSelectArrow.jsx(variantProps);
  return (
    <ak.ComboboxSelectArrow
      {...styleProps}
      {...rest}
      style={{ width: undefined, height: undefined, ...styleProps.style }}
    />
  );
}
