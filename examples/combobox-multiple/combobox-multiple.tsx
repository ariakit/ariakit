import { forwardRef, useEffect, useId } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as Ariakit from "@ariakit/react";

export interface ComboboxProps
  extends Omit<ComponentPropsWithoutRef<"input">, "onChange"> {
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultValues?: string[];
  values?: string[];
  onValuesChange?: (values: string[]) => void;
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
      defaultValue,
      value,
      setValue: onChange,
      resetValueOnHide: true,
    });

    const select = Ariakit.useSelectStore({
      combobox,
      defaultValue: defaultValues,
      value: values,
      setValue: onValuesChange,
    });

    const selectValue = select.useState("value");

    // Reset the combobox value whenever an item is checked or unchecked.
    useEffect(() => combobox.setValue(""), [selectValue, combobox]);

    const defaultInputId = useId();
    const inputId = comboboxProps.id || defaultInputId;

    return (
      <>
        {label && <label htmlFor={inputId}>{label}</label>}
        <Ariakit.Combobox
          ref={ref}
          id={inputId}
          store={combobox}
          className="combobox"
          {...comboboxProps}
        />
        <Ariakit.ComboboxPopover
          store={combobox}
          sameWidth
          gutter={8}
          className="popover"
          render={(props) => <Ariakit.SelectList store={select} {...props} />}
        >
          {children}
        </Ariakit.ComboboxPopover>
      </>
    );
  }
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
        render={(props) => <Ariakit.ComboboxItem {...props} />}
        {...props}
      >
        <Ariakit.SelectItemCheck />
        {props.children || props.value}
      </Ariakit.SelectItem>
    );
  }
);
