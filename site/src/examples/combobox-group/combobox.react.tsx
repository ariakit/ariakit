import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";

export interface ComboboxProps extends Omit<ak.ComboboxProps, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox({ value, onChange, children, ...props }, ref) {
    return (
      <ak.ComboboxProvider value={value} setValue={onChange} placement="bottom">
        <ak.Combobox ref={ref} {...props} className="ak-input w-64" />
        <ak.ComboboxPopover
          portal
          gutter={8}
          overflowPadding={24}
          className={clsx(
            "max-h-[min(var(--popover-available-height),20rem)] w-[calc(var(--popover-anchor-width)+var(--ak-frame-padding)*2)] overflow-clip ak-frame-force-container flex flex-col ak-popover data-open:ak-popover_open not-data-open:ak-popover_closed origin-(--popover-transform-origin)",
          )}
        >
          <div className="ak-frame-cover/1 overflow-auto">{children}</div>
        </ak.ComboboxPopover>
      </ak.ComboboxProvider>
    );
  },
);

export interface ComboboxGroupProps extends ak.ComboboxGroupProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export const ComboboxGroup = React.forwardRef<
  HTMLDivElement,
  ComboboxGroupProps
>(function ComboboxGroup({ label, children, ...props }, ref) {
  return (
    <ak.ComboboxGroup ref={ref} {...props} className="ak-group">
      {label && (
        <ak.ComboboxGroupLabel className="text-sm ak-frame-container/2 font-medium ak-text/60 cursor-default [&+*]:scroll-mt-11">
          {label}
        </ak.ComboboxGroupLabel>
      )}
      {children}
    </ak.ComboboxGroup>
  );
});

export interface ComboboxItemProps extends ak.ComboboxItemProps {}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return (
      <ak.ComboboxItem
        ref={ref}
        focusOnHover
        {...props}
        className="ak-option data-focus-visible:ak-option_focus data-active-item:ak-option_hover"
      />
    );
  },
);

export interface ComboboxSeparatorProps extends ak.ComboboxSeparatorProps {}

export const ComboboxSeparator = React.forwardRef<
  HTMLHRElement,
  ComboboxSeparatorProps
>(function ComboboxSeparator(props, ref) {
  return <ak.ComboboxSeparator ref={ref} {...props} className="ak-separator" />;
});
