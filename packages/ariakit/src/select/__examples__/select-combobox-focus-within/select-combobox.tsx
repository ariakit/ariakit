import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
} from "react";
import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxList,
  useComboboxStore,
} from "ariakit/combobox/store";
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectStore,
} from "ariakit/select/store";

type SelectComboboxProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> & {
  label?: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  open?: boolean;
  onToggle?: (isOpen: boolean) => void;
};

export const SelectCombobox = forwardRef<
  HTMLButtonElement,
  SelectComboboxProps
>(
  (
    {
      label,
      defaultValue,
      value,
      onChange,
      searchValue,
      onSearch,
      searchPlaceholder,
      open,
      onToggle,
      children,
      ...props
    },
    ref
  ) => {
    const combobox = useComboboxStore({
      gutter: 4,
      sameWidth: true,
      open,
      setOpen: onToggle,
      value: searchValue,
      setValue: onSearch,
      resetValueOnHide: true,
    });

    const select = useSelectStore({
      ...combobox,
      defaultValue,
      value,
      setValue: onChange,
    });

    const [popoverFocused, setPopoverFocused] = useState(false);
    const showComboboxCancel = combobox.useState(
      (state) => popoverFocused || state.value !== ""
    );

    const mounted = select.useState("mounted");

    return (
      <>
        {label && <SelectLabel store={select}>{label}</SelectLabel>}
        <Select ref={ref} store={select} className="select" {...props} />
        {mounted && (
          <SelectPopover
            store={select}
            composite={false}
            portal
            className="popover"
            onFocus={() => setPopoverFocused(true)}
            onBlur={() => setPopoverFocused(false)}
          >
            <div className="combobox-wrapper">
              <Combobox
                store={combobox}
                autoSelect
                placeholder={searchPlaceholder}
                className="combobox"
              />
              <ComboboxCancel
                store={combobox}
                className="button secondary combobox-cancel"
                data-visible={showComboboxCancel ? "" : undefined}
              />
            </div>
            <ComboboxList store={combobox}>{children}</ComboboxList>
          </SelectPopover>
        )}
      </>
    );
  }
);

type SelectComboboxItemProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export const SelectComboboxItem = forwardRef<
  HTMLDivElement,
  SelectComboboxItemProps
>(({ value, children, ...props }, ref) => {
  return (
    <ComboboxItem ref={ref} focusOnHover className="select-item" {...props}>
      {(props) => (
        <SelectItem {...props} value={value}>
          {children}
        </SelectItem>
      )}
    </ComboboxItem>
  );
});
