import { createContext, forwardRef, useContext, useEffect } from "react";
import {
  Checkbox,
  CheckboxCheck,
  CheckboxProps,
  CheckboxState,
  useCheckboxState,
} from "ariakit/checkbox";
import {
  Combobox,
  ComboboxItem,
  ComboboxItemProps,
  ComboboxPopover,
  ComboboxProps,
  useComboboxState,
} from "ariakit/combobox";

const CheckboxContext = createContext<CheckboxState<string[]> | null>(null);

export type ComboboxMultipleProps = Omit<
  ComboboxProps,
  "state" | "onChange"
> & {
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultValues?: string[];
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  defaultList?: string[];
  list?: string[];
  onFilter?: (matches: string[]) => void;
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
    defaultList,
    list,
    onFilter,
    children,
    ...comboboxProps
  } = props;

  const combobox = useComboboxState({
    gutter: 8,
    // VoiceOver has issues with multi-selectable comboboxes where the DOM focus
    // is on the combobox input, so we set `virtualFocus` to `false` to disable
    // this behavior and put DOM focus on the items.
    virtualFocus: false,
    defaultValue,
    value,
    setValue: onChange,
    defaultList,
    list,
  });
  const checkbox = useCheckboxState({
    defaultValue: defaultValues,
    value: values,
    setValue: onValuesChange,
  });

  useEffect(() => {
    onFilter?.(combobox.matches);
  }, [combobox.matches]);

  // Reset the combobox value whenever an item is checked or unchecked.
  useEffect(() => {
    combobox.setValue("");
  }, [checkbox.value, combobox.setValue]);

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
      <ComboboxPopover
        state={combobox}
        aria-multiselectable
        className="popover"
      >
        <CheckboxContext.Provider value={checkbox}>
          {children}
        </CheckboxContext.Provider>
      </ComboboxPopover>
    </>
  );
});

export type ComboboxMultipleItemProps = ComboboxItemProps &
  CheckboxProps<"div">;

export const ComboboxMultipleItem = forwardRef<
  HTMLDivElement,
  ComboboxMultipleItemProps
>(({ value, ...props }, ref) => {
  const checkbox = useContext(CheckboxContext);
  if (!checkbox) return null;
  return (
    <ComboboxItem
      ref={ref}
      // All selectable items must have the `aria-selected` attribute set to
      // `true` or `false`.
      aria-selected={!!value && checkbox?.value.includes(value)}
      {...props}
    >
      {(itemProps) => (
        <Checkbox
          {...itemProps}
          // Disable `checked` and `aria-checked` attributes so they don't
          // conflict with the `aria-selected` attribute.
          aria-checked={undefined}
          checked={undefined}
          as="div"
          state={checkbox}
          value={value}
        >
          <CheckboxCheck />
          {value}
        </Checkbox>
      )}
    </ComboboxItem>
  );
});
