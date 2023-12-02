import { forwardRef, useEffect } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as Ariakit from "@ariakit/react";

export interface ComboboxProps
  extends Omit<ComponentPropsWithoutRef<"input">, "onChange"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  defaultValues?: string[];
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(props, ref) {
    const {
      label,
      defaultValue,
      value,
      onChange,
      defaultValues,
      values,
      onValuesChange,
      children,
      ...comboboxProps
    } = props;

    const combobox = Ariakit.useComboboxStore({
      value,
      setValue: onChange,
      defaultValue,
      resetValueOnHide: true,
    });

    const select = Ariakit.useSelectStore({
      combobox,
      value: values,
      setValue: onValuesChange,
      defaultValue: defaultValues,
    });

    const selectValue = select.useState("value");

    // Reset the combobox value whenever an item is checked or unchecked.
    useEffect(() => combobox.setValue(""), [selectValue, combobox]);

    return (
      <>
        {label && (
          <Ariakit.ComboboxLabel store={combobox} className="label">
            {label}
          </Ariakit.ComboboxLabel>
        )}
        <Ariakit.Combobox
          ref={ref}
          store={combobox}
          className="combobox"
          {...comboboxProps}
        />
        <Ariakit.ComboboxPopover
          store={combobox}
          sameWidth
          gutter={8}
          className="popover"
          render={<Ariakit.SelectList store={select} />}
        >
          {children}
        </Ariakit.ComboboxPopover>
      </>
    );
  },
);

export interface ComboboxItemProps extends ComponentPropsWithoutRef<"div"> {
  value?: string;
}

export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return (
      // Here we're combining both SelectItem and ComboboxItem into the same
      // element. SelectItem adds the multi-selectable attributes to the element
      // (for example, aria-selected).
      <Ariakit.SelectItem
        ref={ref}
        className="combobox-item"
        {...props}
        render={<Ariakit.ComboboxItem />}
      >
        <Ariakit.SelectItemCheck />
        {props.children || props.value}
      </Ariakit.SelectItem>
    );
  },
);
