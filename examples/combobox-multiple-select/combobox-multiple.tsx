import * as Ariakit from "@ariakit/react";
import { clsx } from "clsx";
import { forwardRef } from "react";

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

    return (
      <Ariakit.ComboboxProvider<string[]>
        value={value}
        setValue={onChange}
        defaultValue={defaultValue}
        selectedValue={values}
        setSelectedValue={onValuesChange}
        defaultSelectedValue={defaultValues ?? []}
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
          render={<Ariakit.ComboboxList />}
        >
          {children}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    );
  },
);

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {}

export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        {...props}
        className={clsx("combobox-item", props.className)}
      >
        <Ariakit.ComboboxItemCheck />
        {props.children || props.value}
      </Ariakit.ComboboxItem>
    );
  },
);
