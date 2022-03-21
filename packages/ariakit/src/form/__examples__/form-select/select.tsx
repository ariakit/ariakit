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
  onClose?: () => void;
  required?: boolean;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ children, value, setValue, defaultValue, onClose, ...props }, ref) => {
    const select = useSelectState({
      value,
      setValue,
      defaultValue,
      sameWidth: true,
      setVisible: (visible) => {
        if (!visible && onClose) {
          onClose();
        }
      },
    });
    return (
      <>
        <BaseSelect state={select} ref={ref} className="select" {...props}>
          {select.value || "Select an item"}
          <SelectArrow />
        </BaseSelect>
        <SelectPopover state={select} modal className="popover">
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
