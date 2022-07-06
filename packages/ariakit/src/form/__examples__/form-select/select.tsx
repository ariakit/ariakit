import { ButtonHTMLAttributes, HTMLAttributes, forwardRef } from "react";
import {
  Select as BaseSelect,
  SelectItem as BaseSelectItem,
  SelectArrow,
  SelectPopover,
  useSelectState,
} from "ariakit/select";

export type SelectProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  name?: string;
  value?: string;
  setValue?: (value: string) => void;
  defaultValue?: string;
  required?: boolean;
  onTouch?: () => void;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ children, value, setValue, defaultValue, onTouch, ...props }, ref) => {
    const select = useSelectState({
      value,
      setValue,
      defaultValue,
      sameWidth: true,
      setOpen: (open) => {
        if (select.open !== open && !open) {
          onTouch?.();
        }
      },
    });

    return (
      <>
        <BaseSelect
          state={select}
          ref={ref}
          className="select"
          {...props}
          onBlur={(event) => {
            props.onBlur?.(event);
            if (event.defaultPrevented) return;
            const popover = select.popoverRef.current;
            if (popover?.contains(event.relatedTarget)) return;
            onTouch?.();
          }}
        >
          {select.value || "Select an item"}
          <SelectArrow />
        </BaseSelect>
        <SelectPopover
          state={select}
          modal
          className="popover"
          onBlur={(event) => {
            const disclosure = select.disclosureRef.current;
            if (event.currentTarget.contains(event.relatedTarget)) return;
            if (disclosure?.contains(event.relatedTarget)) return;
            onTouch?.();
          }}
        >
          {children}
        </SelectPopover>
      </>
    );
  }
);

export type SelectItemProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (props, ref) => {
    return <BaseSelectItem ref={ref} className="select-item" {...props} />;
  }
);
