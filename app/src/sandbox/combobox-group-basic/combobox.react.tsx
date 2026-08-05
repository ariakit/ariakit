import * as Ariakit from "@ariakit/react";
import { clsx } from "clsx";
import * as React from "react";

export interface ComboboxProps extends Omit<Ariakit.ComboboxProps, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox({ value, onChange, children, ...props }, ref) {
    return (
      <Ariakit.ComboboxProvider inputValue={value} setInputValue={onChange}>
        <Ariakit.Combobox
          ref={ref}
          {...props}
          className={clsx("combobox", props.className)}
        />
        <Ariakit.ComboboxPopover
          portal
          sameWidth
          gutter={4}
          className="relative z-50 flex max-h-[min(var(--popover-available-height,300px),300px)] flex-col overflow-auto overscroll-contain rounded-lg border border-solid border-gray-250 bg-white p-2 text-black shadow-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:shadow-lg-dark"
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
        className={clsx(
          "flex cursor-default scroll-m-2 items-center gap-2 rounded p-2 outline-none hover:bg-blue-200/40 data-[active-item]:bg-blue-600 data-[active-item]:text-white dark:hover:bg-blue-600/25 dark:data-[active-item]:bg-blue-600",
          props.className,
        )}
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
