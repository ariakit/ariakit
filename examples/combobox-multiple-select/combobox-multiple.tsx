import { forwardRef, useEffect } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface ComboboxProps extends Omit<Ariakit.ComboboxProps, "onChange"> {
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

    const combobox = Ariakit.useComboboxStore();
    const select = Ariakit.useSelectStore({ combobox });
    const selectValue = select.useState("value");

    // Reset the combobox value whenever an item is checked or unchecked.
    useEffect(() => combobox.setValue(""), [selectValue, combobox]);

    return (
      <Ariakit.ComboboxProvider
        store={combobox}
        value={value}
        setValue={onChange}
        defaultValue={defaultValue}
        resetValueOnHide
      >
        <Ariakit.SelectProvider
          store={select}
          value={values}
          setValue={onValuesChange}
          defaultValue={defaultValues}
        >
          {label && (
            <Ariakit.ComboboxLabel className="label">
              {label}
            </Ariakit.ComboboxLabel>
          )}
          <Ariakit.Combobox
            ref={ref}
            {...comboboxProps}
            className={clsx("combobox", comboboxProps.className)}
          />
          <Ariakit.ComboboxPopover
            sameWidth
            gutter={8}
            className="popover"
            render={<Ariakit.SelectList />}
          >
            {children}
          </Ariakit.ComboboxPopover>
        </Ariakit.SelectProvider>
      </Ariakit.ComboboxProvider>
    );
  },
);

export interface ComboboxItemProps extends Ariakit.SelectItemProps {}

export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return (
      // Here we're combining both SelectItem and ComboboxItem into the same
      // element. SelectItem adds the multi-selectable attributes to the element
      // (for example, aria-selected).
      <Ariakit.SelectItem
        ref={ref}
        {...props}
        className={clsx("combobox-item", props.className)}
        render={<Ariakit.ComboboxItem render={props.render} />}
      >
        <Ariakit.SelectItemCheck />
        {props.children || props.value}
      </Ariakit.SelectItem>
    );
  },
);
