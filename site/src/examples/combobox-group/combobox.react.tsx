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
        <ak.Combobox
          ref={ref}
          {...props}
          className={clsx("ak-input w-64", props.className)}
        />
        <ak.ComboboxPopover
          portal
          gutter={8}
          overflowPadding={16}
          className={clsx(
            "ak-popover data-open:ak-popover_open not-data-open:ak-popover_closed ak-frame-force-container max-h-[min(var(--popover-available-height),20rem)] w-[calc(var(--popover-anchor-width)+var(--ak-frame-padding)*2)] overflow-clip flex flex-col origin-(--popover-transform-origin)",
          )}
        >
          <div className="ak-popover-scroll scroll-pt-11">{children}</div>
        </ak.ComboboxPopover>
      </ak.ComboboxProvider>
    );
  },
);

export interface ComboboxGroupProps extends ak.ComboboxGroupProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  stickyLabel?: boolean;
}

export const ComboboxGroup = React.forwardRef<
  HTMLDivElement,
  ComboboxGroupProps
>(function ComboboxGroup({ label, children, stickyLabel, ...props }, ref) {
  return (
    <ak.ComboboxGroup
      ref={ref}
      {...props}
      className={clsx("ak-group ak-frame-cover", props.className)}
    >
      {label && (
        <ak.ComboboxGroupLabel
          data-sticky={stickyLabel || undefined}
          className={clsx(
            "text-sm font-medium ak-text/50 cursor-default",
            stickyLabel
              ? "sticky top-(--ak-frame-margin) z-10 ak-layer-current ak-frame-cover/3 pb-[calc(var(--ak-frame-padding)---spacing(1))] border-b mb-1"
              : "ak-frame-container/2 [&+*]:scroll-mt-11",
          )}
        >
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
        blurOnHoverEnd={false}
        {...props}
        className={clsx(
          "ak-option_idle active:ak-option_active data-focus-visible:ak-option_focus data-active-item:ak-option_hover",
          props.className,
        )}
      />
    );
  },
);

export const ComboboxEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function ComboboxEmpty(props, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx("ak-option_idle", props.className)}
    >
      {props.children ?? "No results found"}
    </div>
  );
});
