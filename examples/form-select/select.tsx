import * as React from "react";
import * as Ariakit from "@ariakit/react";

export type SelectProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  name?: string;
  value?: string;
  setValue?: (value: string) => void;
  defaultValue?: string;
  required?: boolean;
  onTouch?: () => void;
};

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ children, value, setValue, defaultValue, onTouch, ...props }, ref) => {
    const portalRef = React.useRef<HTMLDivElement>(null);
    const select = Ariakit.useSelectStore({
      gutter: 4,
      value,
      setValue,
      defaultValue,
      sameWidth: true,
    });
    const selectValue = select.useState(
      (state) => state.value || "Select an item"
    );
    return (
      <>
        <Ariakit.Select
          store={select}
          ref={ref}
          className="select"
          {...props}
          onBlur={(event) => {
            props.onBlur?.(event);
            if (event.defaultPrevented) return;
            const popover = select.getState().popoverElement;
            if (popover?.contains(event.relatedTarget)) return;
            onTouch?.();
          }}
        >
          {selectValue}
          <Ariakit.SelectArrow />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          store={select}
          modal
          portalRef={portalRef}
          className="popover"
          onBlur={(event) => {
            const portal = portalRef.current;
            const disclosure = select.getState().disclosureElement;
            if (portal?.contains(event.relatedTarget)) return;
            if (disclosure?.contains(event.relatedTarget)) return;
            onTouch?.();
          }}
        >
          {children}
        </Ariakit.SelectPopover>
      </>
    );
  }
);

export type SelectItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  (props, ref) => {
    return <Ariakit.SelectItem ref={ref} className="select-item" {...props} />;
  }
);
