import {
  HTMLAttributes,
  InputHTMLAttributes,
  forwardRef,
  useEffect,
} from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import {
  SelectItem,
  SelectItemCheck,
  SelectList,
  useSelectState,
} from "ariakit/select";

export type ComboboxMultipleProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
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

export const ComboboxMultiple = forwardRef<
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

  const combobox = useComboboxState({
    // VoiceOver has issues with multi-selectable comboboxes where the DOM focus
    // is on the combobox input, so we set `virtualFocus` to `false` to disable
    // this behavior and put DOM focus on the items.
    virtualFocus: false,
    sameWidth: true,
    gutter: 8,
    defaultValue,
    value,
    setValue: onChange,
  });
  const select = useSelectState({
    ...combobox,
    defaultValue: defaultValues,
    value: values,
    setValue: onValuesChange,
  });

  // Reset the combobox value whenever an item is checked or unchecked.
  useEffect(() => {
    combobox.setValue("");
  }, [select.value, combobox.setValue]);

  const element = (
    <Combobox
      ref={ref}
      state={combobox}
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
      <ComboboxPopover state={combobox} className="popover">
        {(popoverProps) => (
          <SelectList
            state={select}
            // Disable the composite behavior on the select list since combobox
            // will handle it.
            composite={false}
            // Disable typeahead so it doesn't conflict with typing on the
            // combobox input.
            typeahead={false}
            {...popoverProps}
          >
            {children}
          </SelectList>
        )}
      </ComboboxPopover>
    </>
  );
});

export type ComboboxMultipleItemProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export const ComboboxMultipleItem = forwardRef<
  HTMLDivElement,
  ComboboxMultipleItemProps
>(({ value, ...props }, ref) => {
  return (
    // Here we're combining both SelectItem and ComboboxItem into the same
    // element. SelectItem adds the multi-selectable attributes to the element
    // (for example, aria-selected).
    <SelectItem
      ref={ref}
      value={value}
      //We're not registering the select item because the combobox item (the
      // same element) already handles it.
      shouldRegisterItem={false}
      className="combobox-item"
      {...props}
    >
      {(itemProps) => (
        <ComboboxItem {...itemProps}>
          <SelectItemCheck />
          {value}
        </ComboboxItem>
      )}
    </SelectItem>
  );
});
