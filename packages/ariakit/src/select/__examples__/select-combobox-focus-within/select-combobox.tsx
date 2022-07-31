import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";
import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";

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
    const combobox = useComboboxState({
      gutter: 4,
      sameWidth: true,
      open,
      setOpen: (open) => {
        if (combobox.open !== open) {
          onToggle?.(open);
        }
      },
      value: searchValue,
      setValue: (value) => {
        if (combobox.value !== value) {
          onSearch?.(value);
        }
      },
    });

    const select = useSelectState({
      ...combobox,
      defaultValue,
      value,
      setValue: (value) => {
        if (select.value !== value) {
          onChange?.(value);
        }
      },
    });

    const [popoverFocused, setPopoverFocused] = useState(false);
    const showComboboxCancel = popoverFocused || combobox.value !== "";

    // Resets combobox value when popover is collapsed
    useEffect(() => {
      if (select.mounted) return;
      combobox.setValue("");
    }, [select.mounted, combobox.setValue]);

    return (
      <>
        {label && <SelectLabel state={select}>{label}</SelectLabel>}
        <Select ref={ref} state={select} className="select" {...props} />
        {select.mounted && (
          <SelectPopover
            state={select}
            composite={false}
            portal
            className="popover"
            onFocus={() => setPopoverFocused(true)}
            onBlur={() => setPopoverFocused(false)}
          >
            <div className="combobox-wrapper">
              <Combobox
                state={combobox}
                autoSelect
                placeholder={searchPlaceholder}
                className="combobox"
              />
              <ComboboxCancel
                state={combobox}
                className="button secondary combobox-cancel"
                data-visible={showComboboxCancel ? "" : undefined}
              />
            </div>
            <ComboboxList state={combobox}>{children}</ComboboxList>
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
