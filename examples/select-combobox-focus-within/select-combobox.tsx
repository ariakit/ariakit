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
    const combobox = Ariakit.useComboboxStore({
      open,
      setOpen: onToggle,
      value: searchValue,
      setValue: onSearch,
      selectedValue: value,
      setSelectedValue: onChange,
      defaultSelectedValue: defaultValue,
      resetValueOnHide: true,
    });

    const [popoverFocused, setPopoverFocused] = React.useState(false);
    const showComboboxCancel = Ariakit.useStoreState(
      combobox,
      (state) => popoverFocused || state.value !== "",
    );

    const mounted = Ariakit.useStoreState(combobox, "mounted");

    return (
      <>
        {label && (
          <Ariakit.ComboboxSelectLabel store={combobox}>
            {label}
          </Ariakit.ComboboxSelectLabel>
        )}
        <Ariakit.ComboboxSelect
          ref={ref}
          store={combobox}
          className="button"
          {...props}
        />
        {mounted && (
          <Ariakit.ComboboxPopover
            store={combobox}
            portal
            gutter={4}
            sameWidth
            className="popover"
            onFocus={() => setPopoverFocused(true)}
            onBlur={() => setPopoverFocused(false)}
          >
            <div className="combobox-wrapper">
              <Ariakit.ComboboxInput
                store={combobox}
                autoSelect
                placeholder={searchPlaceholder}
                className="combobox"
              />
              <Ariakit.ComboboxCancel
                store={combobox}
                className="button secondary combobox-cancel"
                data-visible={showComboboxCancel ? "" : undefined}
              />
            </div>
            <Ariakit.ComboboxList store={combobox}>
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
