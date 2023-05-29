import * as React from "react";
import * as Ariakit from "@ariakit/react";

interface FilterSelectProps
  extends Omit<Ariakit.SelectProps, "store" | "onChange"> {
  label: string;
  defaultValue?: Ariakit.SelectStoreProps["defaultValue"];
  value?: Ariakit.SelectStoreProps["value"];
  onChange?: Ariakit.SelectStoreProps["setValue"];
  defaultOpen?: Ariakit.SelectStoreProps["defaultOpen"];
  open?: Ariakit.SelectStoreProps["open"];
  onToggle?: Ariakit.SelectStoreProps["setOpen"];
  onRemove?: () => void;
}

export const FilterSelect = React.forwardRef<
  HTMLButtonElement,
  FilterSelectProps
>(function FilterSelect(
  {
    label,
    defaultValue,
    value,
    onChange,
    defaultOpen,
    open,
    onToggle,
    onRemove,
    children,
    ...props
  },
  ref
) {
  const labelId = React.useId();
  const select = Ariakit.useSelectStore({
    defaultValue,
    value,
    setValue: onChange,
    defaultOpen,
    open,
    setOpen(open) {
      onToggle?.(open);
      if (!open && !select.getState().value) {
        onRemove?.();
      }
    },
  });
  const selectValue = select.useState("value");
  return (
    <>
      <div className="filter">
        <Ariakit.Select
          ref={ref}
          className="select"
          {...props}
          store={select}
          aria-labelledby={labelId}
        >
          <div>
            <span id={labelId} aria-hidden>
              {label}:{" "}
            </span>
            {selectValue || "Choose one"}
          </div>
        </Ariakit.Select>
        {onRemove && (
          <Ariakit.Button
            className="select"
            aria-label={`Remove ${label} filter`}
            onClick={() => onRemove()}
          >
            &times;
          </Ariakit.Button>
        )}
      </div>
      <Ariakit.SelectPopover
        store={select}
        aria-labelledby={labelId}
        gutter={4}
        className="popover"
      >
        {children}
      </Ariakit.SelectPopover>
    </>
  );
});

interface FilterSelectItemProps extends Ariakit.SelectItemProps {
  children?: React.ReactNode;
}

export const FilterSelectItem = React.forwardRef<
  HTMLDivElement,
  FilterSelectItemProps
>(function FilterSelectItem(props, ref) {
  return (
    <Ariakit.SelectItem ref={ref} className="select-item" {...props}>
      <Ariakit.SelectItemCheck />
      {props.children ?? props.value}
    </Ariakit.SelectItem>
  );
});
