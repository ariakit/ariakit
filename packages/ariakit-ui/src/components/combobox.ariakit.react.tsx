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
  comboboxList,
  comboboxSelect,
  comboboxSelectArrow,
  comboboxItemCheck,
  comboboxSelectLabel,
  comboboxSelectPlaceholder,
  comboboxLabel,
  comboboxPopover,
} from "../styles/combobox.ts";
import { wrapsSlotChildren } from "../styles/control.ts";

export interface ComboboxProps
  extends
    Omit<ComboboxInputProps, "value" | "defaultValue" | "popover">,
    Pick<
      ComboboxProviderProps,
      "inputValue" | "setInputValue" | "defaultInputValue"
    > {
  /**
   * Label content, a custom element, or `ComboboxLabel` props. Omitted by
   * default; use `aria-label` or `aria-labelledby` to name an unlabeled input.
   */
  label?: React.ReactNode | ComboboxLabelProps;
  /**
   * Custom popover element or `ComboboxPopover` props. Defaults to a
   * `ComboboxPopover` containing the combobox children.
   */
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

/**
 * Shares input, selection, and popover state with combobox components.
 * @example
 * <ComboboxProvider>
 *   <ComboboxInput aria-label="Fruit" />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 */
export function ComboboxProvider(props: ComboboxProviderProps) {
  return <ak.ComboboxProvider {...props} />;
}

export interface ComboboxInputProps
  extends
    ak.ComboboxProps,
    Omit<VariantProps<typeof comboboxInput>, "$disabled"> {}

/**
 * A text field that opens a combobox suggestion list.
 * @example
 * <ComboboxProvider>
 *   <ComboboxInput aria-label="Fruit" />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 */
export function ComboboxInput(props: ComboboxInputProps) {
  const [variantProps, rest] = splitProps(props, comboboxInput);
  return <ak.Combobox {...comboboxInput.jsx(variantProps)} {...rest} />;
}

export interface ComboboxLabelProps
  extends ak.ComboboxLabelProps, VariantProps<typeof comboboxLabel> {}

/**
 * A visible label for a combobox input.
 * @example
 * <Combobox label={<ComboboxLabel>Fruit</ComboboxLabel>}>
 *   <ComboboxItem value="Apple" />
 * </Combobox>
 */
export function ComboboxLabel(props: ComboboxLabelProps) {
  const [variantProps, rest] = splitProps(props, comboboxLabel);
  return <ak.ComboboxLabel {...comboboxLabel.jsx(variantProps)} {...rest} />;
}

export interface ComboboxPopoverProps
  extends ak.ComboboxPopoverProps, VariantProps<typeof comboboxPopover> {}

/**
 * The popup that contains combobox suggestions. Uses a portal and an 8px gap
 * from the input by default.
 * @example
 * <Combobox label="Fruit" popover={<ComboboxPopover gutter={4} />}>
 *   <ComboboxItem value="Apple" />
 * </Combobox>
 */
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

/**
 * Groups options inside a popover that also contains a search field or other
 * content. The list owns the listbox role and the popover becomes a dialog.
 * @example
 * <Combobox label="Fruit" popover={{ "aria-label": "Fruit suggestions" }}>
 *   <ComboboxList aria-label="Suggestions">
 *     <ComboboxItem value="Apple" />
 *   </ComboboxList>
 *   <p>Select a fruit.</p>
 * </Combobox>
 */
export function ComboboxList(props: ComboboxListProps) {
  const [variantProps, rest] = splitProps(props, comboboxList);
  return <ak.ComboboxList {...comboboxList.jsx(variantProps)} {...rest} />;
}

export interface ComboboxGroupProps
  extends ak.ComboboxGroupProps, VariantProps<typeof comboboxGroup> {
  /**
   * Label content, a custom element, or `ComboboxGroupLabel` props. Omitted by
   * default.
   */
  label?: React.ReactNode | ComboboxGroupLabelProps;
}

/**
 * Groups related suggestions under an optional label.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxGroup label="Citrus">
 *     <ComboboxItem value="Orange" />
 *   </ComboboxGroup>
 * </Combobox>
 */
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

/**
 * A visible label for a group of suggestions.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxGroup label={<ComboboxGroupLabel>Citrus</ComboboxGroupLabel>}>
 *     <ComboboxItem value="Orange" />
 *   </ComboboxGroup>
 * </Combobox>
 */
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
  /**
   * Shows a selection checkmark before or after the label. Defaults to `false`.
   */
  checkmark?: "before" | "after" | false;
}

/**
 * A suggestion row that displays its `value` when children are omitted. Custom
 * children can use `ComboboxItemSlot`, `ComboboxItemContent`,
 * `ComboboxItemLabel`, and `ComboboxItemDescription` for icons and secondary
 * text. Focus follows pointer hover by default.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple" />
 * </Combobox>
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

/**
 * A selection checkmark that keeps its space when unselected so item labels
 * stay aligned. Render it inside a `ComboboxItem`.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple">
 *     <ComboboxItemCheck />
 *     <ComboboxItemLabel>Apple</ComboboxItemLabel>
 *   </ComboboxItem>
 * </Combobox>
 */
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

/**
 * Displays an empty-state message. Render it when filtering leaves no
 * suggestions, beside `ComboboxList` so it is outside the options. Defaults to
 * "No results found" when children are omitted.
 *
 * For announcements, keep a separate status region mounted outside the popover
 * and update its text when the matches change. A status mounted only with the
 * empty state can be silent. Hide the visual message from screen readers when
 * the separate region supplies its text.
 * @example
 * import { useState } from "react";
 *
 * function Example() {
 *   const [inputValue, setInputValue] = useState("");
 *   const matches = ["Apple", "Orange"].filter((fruit) =>
 *     fruit.toLowerCase().includes(inputValue.toLowerCase()),
 *   );
 *   const empty = matches.length === 0;
 *   return (
 *     <>
 *       <Combobox
 *         label="Fruit"
 *         inputValue={inputValue}
 *         setInputValue={setInputValue}
 *         popover={{ "aria-label": "Fruit suggestions" }}
 *       >
 *         <ComboboxList aria-label="Suggestions">
 *           {matches.map((fruit) => <ComboboxItem key={fruit} value={fruit} />)}
 *         </ComboboxList>
 *         {empty && <ComboboxEmpty aria-hidden />}
 *       </Combobox>
 *       <div role="status" className="sr-only">
 *         {empty ? "No results found" : `${matches.length} results found`}
 *       </div>
 *     </>
 *   );
 * }
 */
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

/**
 * Stacks a suggestion's label and description.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple">
 *     <ComboboxItemContent>
 *       <ComboboxItemLabel>Apple</ComboboxItemLabel>
 *       <ComboboxItemDescription>Sweet and crisp</ComboboxItemDescription>
 *     </ComboboxItemContent>
 *   </ComboboxItem>
 * </Combobox>
 */
export function ComboboxItemContent(props: ComboboxItemContentProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemContent);
  return <ak.Role.span {...comboboxItemContent.jsx(variantProps)} {...rest} />;
}

export interface ComboboxItemDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof comboboxItemDescription> {}

/**
 * Secondary text below a suggestion's label.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple">
 *     <ComboboxItemContent>
 *       <ComboboxItemLabel>Apple</ComboboxItemLabel>
 *       <ComboboxItemDescription>Sweet and crisp</ComboboxItemDescription>
 *     </ComboboxItemContent>
 *   </ComboboxItem>
 * </Combobox>
 */
export function ComboboxItemDescription(props: ComboboxItemDescriptionProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemDescription);
  return (
    <ak.Role.span {...comboboxItemDescription.jsx(variantProps)} {...rest} />
  );
}

export interface ComboboxItemLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof comboboxItemLabel> {}

/**
 * The main text of a suggestion.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple">
 *     <ComboboxItemLabel>Apple</ComboboxItemLabel>
 *   </ComboboxItem>
 * </Combobox>
 */
export function ComboboxItemLabel(props: ComboboxItemLabelProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemLabel);
  return <ak.Role.span {...comboboxItemLabel.jsx(variantProps)} {...rest} />;
}

export interface ComboboxItemSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof comboboxItemSlot> {}

/**
 * An icon or other content beside a suggestion's label.
 * @example
 * <Combobox label="Fruit">
 *   <ComboboxItem value="Apple">
 *     <ComboboxItemSlot aria-hidden>★</ComboboxItemSlot>
 *     <ComboboxItemLabel>Apple</ComboboxItemLabel>
 *   </ComboboxItem>
 * </Combobox>
 */
export function ComboboxItemSlot(props: ComboboxItemSlotProps) {
  const [variantProps, rest] = splitProps(props, comboboxItemSlot);
  const variants = comboboxItemSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...comboboxItemSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface ComboboxSelectedValueProps
  extends ak.ComboboxSelectedValueProps {}

// React renders adjacent strings without separators.
function joinSelectedValue(value: string | readonly string[]) {
  if (typeof value === "string") {
    return value;
  }
  return value.join(", ");
}

/**
 * Renders the selected value. When several items are selected, it joins their
 * values with a comma. Pass a function as children to render them differently.
 * @example
 * <ComboboxProvider defaultSelectedValue="Apple">
 *   <p>Selected fruit: <ComboboxSelectedValue /></p>
 * </ComboboxProvider>
 */
export function ComboboxSelectedValue({
  children = joinSelectedValue,
  ...props
}: ComboboxSelectedValueProps) {
  return (
    <ak.ComboboxSelectedValue {...props}>{children}</ak.ComboboxSelectedValue>
  );
}

export interface ComboboxSelectLabelProps
  extends
    ak.ComboboxSelectLabelProps,
    VariantProps<typeof comboboxSelectLabel> {}

/**
 * A visible label for a combobox select button.
 * @example
 * <ComboboxProvider>
 *   <ComboboxSelectLabel>Fruit</ComboboxSelectLabel>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 */
export function ComboboxSelectLabel(props: ComboboxSelectLabelProps) {
  const [variantProps, rest] = splitProps(props, comboboxSelectLabel);
  return (
    <ak.ComboboxSelectLabel
      {...comboboxSelectLabel.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface ComboboxSelectProps
  extends ak.ComboboxSelectProps, VariantProps<typeof comboboxSelect> {
  /**
   * Icon beside the display value, opposite the chevron when one is shown.
   * Renders before the value when `chevron` is `false`.
   */
  icon?: React.ReactNode;
  /**
   * Places the chevron before or after the display value. Defaults to `after`.
   * Set `false` to hide it.
   */
  chevron?: "before" | "after" | false;
  /**
   * Content shown in place of the selected value. Takes precedence over
   * children and `placeholder`.
   */
  displayValue?: React.ReactNode;
  /**
   * Prompt to show with placeholder ink when the selection is empty. Set the
   * provider's `defaultSelectedValue=""` or control its `selectedValue` to
   * start empty; otherwise, the store selects the first item. Custom
   * `displayValue` or `children` take precedence.
   */
  placeholder?: React.ReactNode;
}

/**
 * A button that shows the selected value and opens the suggestion list.
 * @example
 * <ComboboxProvider defaultSelectedValue="Apple">
 *   <ComboboxSelect aria-label="Fruit" />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 */
export function ComboboxSelect({
  icon,
  chevron = "after",
  displayValue,
  placeholder,
  ...props
}: ComboboxSelectProps) {
  const [variantProps, rest] = splitProps(props, comboboxSelect);
  const arrow = chevron !== false && <ComboboxSelectArrow $mx="closeGap" />;
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
          <ComboboxSelectedValue>
            {(value) =>
              value.length || !isRenderable(placeholder) ? (
                joinSelectedValue(value)
              ) : (
                <span {...comboboxSelectPlaceholder.jsx()}>{placeholder}</span>
              )
            }
          </ComboboxSelectedValue>
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

/**
 * A decorative arrow for a combobox select button. `ComboboxSelect` renders it
 * automatically; use the `chevron` prop to move or remove it.
 */
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
