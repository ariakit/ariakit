import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import {
  comboboxEmpty,
  comboboxGroup,
  comboboxGroupLabel,
  comboboxInput,
  comboboxItem,
  comboboxLabel,
  comboboxPopover,
} from "../styles/combobox.ts";
import { controlLabel } from "../styles/control.ts";

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
    label != null ? createRender(ComboboxLabel, label) : null;
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
      {label != null && createRender(ComboboxGroupLabel, label)}
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
 * Suggestion row. Custom children can use ControlSlot, ControlContent,
 * ControlLabel, and ControlDescription to lay out an avatar and secondary text.
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
      {rest.children ?? <span {...controlLabel.jsx()}>{rest.value}</span>}
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
