import * as Ariakit from "@ariakit/react";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

export interface ComboboxProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "onChange"
> {
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

    const combobox = Ariakit.useComboboxStore<string[]>({
      value,
      setValue: onChange,
      defaultValue,
      selectedValue: values,
      setSelectedValue: onValuesChange,
      defaultSelectedValue: defaultValues ?? [],
    });

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
        >
          <Ariakit.ComboboxList store={combobox}>
            {children}
          </Ariakit.ComboboxList>
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
      <Ariakit.ComboboxItem ref={ref} className="combobox-item" {...props}>
        <Ariakit.ComboboxItemCheck />
        {props.children || props.value}
      </Ariakit.ComboboxItem>
    );
  },
);
