import * as React from "react";
import * as Ariakit from "@ariakit/react";

export type ComboboxMultipleProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "autoComplete" | "onChange"
> & {
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultValues?: string[];
  values?: string[];
  onValuesChange?: (values: string[]) => void;
};

export const ComboboxMultiple = React.forwardRef<
  HTMLInputElement,
  ComboboxMultipleProps
>((props, ref) => {
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
    // VoiceOver has issues with multi-selectable comboboxes where the DOM focus
    // is on the combobox input, so we set `virtualFocus` to `false` to disable
    // this behavior and put DOM focus on the items.
    virtualFocus: false,
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
  React.useEffect(() => {
    combobox.setValue("");
  }, [selectValue, combobox]);

  const element = (
    <Ariakit.Combobox
      ref={ref}
      store={combobox}
      className="combobox"
      {...comboboxProps}
    />
  );

  return (
    <>
      {label ? (
        <label className="label">
          {label}
          {element}
        </label>
      ) : (
        element
      )}
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={8}
        sameWidth
        className="popover"
      >
        {(popoverProps) => (
          <Ariakit.SelectList
            store={select}
            // Disable the composite behavior on the select list since combobox
            // will handle it.
            composite={false}
            // Disable typeahead so it doesn't conflict with typing on the
            // combobox input.
            typeahead={false}
            aria-multiselectable
            {...popoverProps}
          >
            {children}
          </Ariakit.SelectList>
        )}
      </Ariakit.ComboboxPopover>
    </>
  );
});

export type ComboboxMultipleItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export const ComboboxMultipleItem = React.forwardRef<
  HTMLDivElement,
  ComboboxMultipleItemProps
>(({ value, ...props }, ref) => {
  return (
    // Here we're combining both SelectItem and ComboboxItem into the same
    // element. SelectItem adds the multi-selectable attributes to the element
    // (for example, aria-selected).
    <Ariakit.SelectItem
      ref={ref}
      value={value}
      // We're not registering the select item because the combobox item (the
      // same element) already handles it.
      // shouldRegisterItem={false}
      className="combobox-item"
      autoFocus={false}
      {...props}
    >
      {(itemProps) => (
        <Ariakit.ComboboxItem {...itemProps}>
          <Ariakit.SelectItemCheck />
          {value}
        </Ariakit.ComboboxItem>
      )}
    </Ariakit.SelectItem>
  );
});
