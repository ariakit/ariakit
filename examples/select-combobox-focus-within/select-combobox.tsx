import * as Ariakit from "@ariakit/react";
import * as React from "react";

type SelectComboboxProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> & {
  label?: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  open?: boolean;
  onToggle?: (isOpen: boolean) => void;
};

export const SelectCombobox = React.forwardRef<
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
    ref,
  ) => {
    const selectedValueProps =
      value !== undefined
        ? { selectedValue: value, setSelectedValue: onChange }
        : {
            defaultSelectedValue: defaultValue ?? "",
            setSelectedValue: onChange,
          };
    const select = Ariakit.useComboboxStore<string>({
      open,
      setOpen: onToggle,
      value: searchValue,
      setValue: onSearch,
      resetValueOnHide: true,
      ...selectedValueProps,
    });

    const [popoverFocused, setPopoverFocused] = React.useState(false);
    const showComboboxCancel = Ariakit.useStoreState(
      select,
      (state) => popoverFocused || state.value !== "",
    );

    const mounted = Ariakit.useStoreState(select, "mounted");

    return (
      <>
        {label && (
          <Ariakit.ComboboxSelectLabel store={select}>
            {label}
          </Ariakit.ComboboxSelectLabel>
        )}
        <Ariakit.ComboboxSelect
          ref={ref}
          store={select}
          className="button"
          {...props}
        />
        {mounted && (
          <Ariakit.ComboboxPopover
            store={select}
            portal
            gutter={4}
            sameWidth
            className="popover"
            onFocus={() => setPopoverFocused(true)}
            onBlur={() => setPopoverFocused(false)}
          >
            <div className="combobox-wrapper">
              <Ariakit.Combobox
                store={select}
                autoSelect
                placeholder={searchPlaceholder}
                className="combobox"
              />
              <Ariakit.ComboboxCancel
                store={select}
                className="button secondary combobox-cancel"
                data-visible={showComboboxCancel ? "" : undefined}
              />
            </div>
            <Ariakit.ComboboxList store={select}>
              {children}
            </Ariakit.ComboboxList>
          </Ariakit.ComboboxPopover>
        )}
      </>
    );
  },
);

type SelectComboboxItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export const SelectComboboxItem = React.forwardRef<
  HTMLDivElement,
  SelectComboboxItemProps
>(({ value, ...props }, ref) => {
  return (
    <Ariakit.ComboboxItem
      ref={ref}
      focusOnHover
      className="select-item"
      value={value}
      {...props}
    />
  );
});
