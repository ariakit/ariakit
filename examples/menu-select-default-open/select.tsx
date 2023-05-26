import * as React from "react";
import * as Ariakit from "@ariakit/react";

interface SelectProps extends Omit<Ariakit.SelectProps, "store" | "onChange"> {
  defaultOpen?: Ariakit.SelectStoreProps["defaultOpen"];
  open?: Ariakit.SelectStoreProps["open"];
  onToggle?: Ariakit.SelectStoreProps["setOpen"];
  defaultValue?: Ariakit.SelectStoreProps["defaultValue"];
  value?: Ariakit.SelectStoreProps["value"];
  onChange?: Ariakit.SelectStoreProps["setValue"];
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      defaultOpen,
      open,
      onToggle,
      defaultValue,
      value,
      onChange,
      children,
      ...props
    },
    ref
  ) {
    const select = Ariakit.useSelectStore({
      defaultOpen,
      open,
      setOpen: onToggle,
      defaultValue,
      value,
      setValue: onChange,
    });
    return (
      <>
        <Ariakit.Select
          ref={ref}
          className="select"
          {...props}
          store={select}
        />
        <Ariakit.SelectPopover store={select} sameWidth className="popover">
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
