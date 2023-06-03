import * as React from "react";
import * as Ariakit from "@ariakit/react";

interface SelectProps extends Omit<Ariakit.SelectProps, "store" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  function Select({ value, onChange, defaultValue, children, ...props }, ref) {
    const select = Ariakit.useSelectStore({
      value,
      setValue: onChange,
      defaultValue,
    });

    return (
      <>
        <Ariakit.Select ref={ref} {...props} store={select} />
        <Ariakit.SelectPopover store={select} gutter={4} className="popover">
          {children}
        </Ariakit.SelectPopover>
      </>
    );
  }
);

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  Ariakit.SelectItemProps
>(function SelectItem(props, ref) {
  return <Ariakit.SelectItem ref={ref} className="select-item" {...props} />;
});

export const SelectArrow = Ariakit.SelectArrow;
