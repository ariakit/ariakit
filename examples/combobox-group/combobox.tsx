import * as React from "react";
import * as Ariakit from "@ariakit/react";

export interface ComboboxProps
  extends Omit<Ariakit.ComboboxProps, "store" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox({ value, onChange, children, ...props }, ref) {
    const combobox = Ariakit.useComboboxStore({ value, setValue: onChange });
    return (
      <>
        <Ariakit.Combobox
          ref={ref}
          store={combobox}
          className="combobox"
          {...props}
        />
        <Ariakit.ComboboxPopover
          store={combobox}
          portal
          sameWidth
          gutter={4}
          className="popover"
        >
          {children}
        </Ariakit.ComboboxPopover>
      </>
    );
  }
);

export interface ComboboxGroupProps extends Ariakit.ComboboxGroupProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export const ComboboxGroup = React.forwardRef<
  HTMLDivElement,
  ComboboxGroupProps
>(function ComboboxGroup({ label, children, ...props }, ref) {
  return (
    <Ariakit.ComboboxGroup ref={ref} className="group" {...props}>
      {label && (
        <Ariakit.ComboboxGroupLabel className="group-label">
          {label}
        </Ariakit.ComboboxGroupLabel>
      )}
      {children}
    </Ariakit.ComboboxGroup>
  );
});

export type ComboboxItemProps = Ariakit.ComboboxItemProps;

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        focusOnHover
        className="combobox-item"
        {...props}
      />
    );
  }
);

export type ComboboxSeparatorProps = Ariakit.ComboboxSeparatorProps;

export const ComboboxSeparator = React.forwardRef<
  HTMLHRElement,
  ComboboxSeparatorProps
>(function ComboboxSeparator(props, ref) {
  return (
    <Ariakit.ComboboxSeparator ref={ref} className="separator" {...props} />
  );
});
