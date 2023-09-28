import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface ComboboxProps extends Omit<Ariakit.ComboboxProps, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox({ value, onChange, children, ...props }, ref) {
    return (
      <Ariakit.ComboboxProvider value={value} setValue={onChange}>
        <Ariakit.Combobox
          ref={ref}
          {...props}
          className={clsx("combobox", props.className)}
        />
        <Ariakit.ComboboxPopover
          portal
          sameWidth
          gutter={4}
          className="popover"
        >
          {children}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    );
  },
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
    <Ariakit.ComboboxGroup
      ref={ref}
      {...props}
      className={clsx("group", props.className)}
    >
      {label && (
        <Ariakit.ComboboxGroupLabel className="group-label">
          {label}
        </Ariakit.ComboboxGroupLabel>
      )}
      {children}
    </Ariakit.ComboboxGroup>
  );
});

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        focusOnHover
        {...props}
        className={clsx("combobox-item", props.className)}
      />
    );
  },
);

export interface ComboboxSeparatorProps
  extends Ariakit.ComboboxSeparatorProps {}

export const ComboboxSeparator = React.forwardRef<
  HTMLHRElement,
  ComboboxSeparatorProps
>(function ComboboxSeparator(props, ref) {
  return (
    <Ariakit.ComboboxSeparator
      ref={ref}
      {...props}
      className={clsx("separator", props.className)}
    />
  );
});
