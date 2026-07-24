import * as Ariakit from "@ariakit/react";
import { clsx } from "clsx";
import * as React from "react";

export interface SelectProps extends Ariakit.ComboboxSelectProps {
  value?: string;
  setValue?: (value: string) => void;
  defaultValue?: string;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  function Select({ children, value, setValue, defaultValue, ...props }, ref) {
    const selectedValueProps =
      value !== undefined
        ? { selectedValue: value, setSelectedValue: setValue }
        : {
            defaultSelectedValue: defaultValue ?? "",
            setSelectedValue: setValue,
          };
    const select = Ariakit.useComboboxStore<string>(selectedValueProps);
    const portalRef = React.useRef<HTMLDivElement>(null);
    const selectValue = Ariakit.useStoreState(select, "selectedValue");

    // Only call onBlur if the focus is leaving the whole widget.
    const onBlur = (event: React.FocusEvent<HTMLElement>) => {
      const portal = portalRef.current;
      const { selectElement, popoverElement } = select.getState();
      if (portal?.contains(event.relatedTarget)) return;
      if (selectElement?.contains(event.relatedTarget)) return;
      if (popoverElement?.contains(event.relatedTarget)) return;
      props.onBlur?.(event);
    };

    return (
      <>
        <Ariakit.ComboboxSelect
          ref={ref}
          {...props}
          store={select}
          onBlur={onBlur}
          className={clsx("button", props.className)}
        >
          {selectValue || "Select an item"}
          <Ariakit.ComboboxSelectArrow />
        </Ariakit.ComboboxSelect>
        <Ariakit.ComboboxPopover
          store={select}
          modal
          composite
          sameWidth
          gutter={4}
          onBlur={onBlur}
          portalRef={portalRef}
          className="popover"
        >
          {children}
        </Ariakit.ComboboxPopover>
      </>
    );
  },
);

export interface SelectItemProps extends Ariakit.ComboboxItemProps {}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem(props, ref) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        {...props}
        className={clsx("select-item", props.className)}
      />
    );
  },
);
