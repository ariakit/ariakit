import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
} from "react";
import * as Ariakit from "@ariakit/react";

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
    const combobox = Ariakit.useComboboxStore({
      gutter: 4,
      sameWidth: true,
      open,
      setOpen: onToggle,
      value: searchValue,
      setValue: onSearch,
      resetValueOnHide: true,
    });

    const select = Ariakit.useSelectStore({
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
        {label && (
          <Ariakit.SelectLabel store={select}>{label}</Ariakit.SelectLabel>
        )}
        <Ariakit.Select
          ref={ref}
          store={select}
          className="select"
          {...props}
        />
        {mounted && (
          <Ariakit.SelectPopover
            store={select}
            composite={false}
            portal
            className="popover"
            onFocus={() => setPopoverFocused(true)}
            onBlur={() => setPopoverFocused(false)}
          >
            <div className="combobox-wrapper">
              <Ariakit.Combobox
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
          </Ariakit.SelectPopover>
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
    <Ariakit.ComboboxItem
      ref={ref}
      focusOnHover
      className="select-item"
      {...props}
    >
      {(props) => (
        <Ariakit.SelectItem {...props} value={value}>
          {children}
        </Ariakit.SelectItem>
      )}
    </Ariakit.ComboboxItem>
  );
});
