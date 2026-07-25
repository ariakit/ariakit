import * as Ariakit from "@ariakit/react";
import * as React from "react";

interface FilterSelectProps extends Omit<
  Ariakit.ComboboxSelectProps,
  "store" | "onChange" | "onToggle"
> {
  label: string;
  defaultValue?: Ariakit.ComboboxStoreProps<string>["defaultSelectedValue"];
  value?: Ariakit.ComboboxStoreProps<string>["selectedValue"];
  onChange?: Ariakit.ComboboxStoreProps<string>["setSelectedValue"];
  defaultOpen?: Ariakit.ComboboxStoreProps["defaultOpen"];
  open?: Ariakit.ComboboxStoreProps["open"];
  onToggle?: Ariakit.ComboboxStoreProps["setOpen"];
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
  ref,
) {
  const labelId = React.useId();
  const select = Ariakit.useComboboxStore({
    selectedValue: value,
    setSelectedValue: onChange,
    defaultSelectedValue: defaultValue,
    defaultOpen,
    open,
    setOpen(open) {
      onToggle?.(open);
      if (!open && !select.getState().selectedValue) {
        onRemove?.();
      }
    },
  });
  const selectedValue = Ariakit.useStoreState(select, "selectedValue");
  return (
    <div className="filter">
      <Ariakit.ComboboxSelect
        ref={ref}
        className="button select"
        {...props}
        store={select}
        aria-labelledby={labelId}
      >
        <div>
          <span id={labelId} aria-hidden>
            {label}:{" "}
          </span>
          {selectedValue || "Choose one"}
        </div>
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover
        store={select}
        aria-labelledby={labelId}
        autoFocusOnShow
        gutter={4}
        className="popover"
      >
        {children}
      </Ariakit.ComboboxPopover>
      {onRemove && (
        <Ariakit.Button
          className="button select"
          aria-label={`Remove ${label} filter`}
          onClick={() => onRemove()}
        >
          &times;
        </Ariakit.Button>
      )}
    </div>
  );
});

interface FilterSelectItemProps extends Ariakit.ComboboxItemProps {}

export const FilterSelectItem = React.forwardRef<
  HTMLDivElement,
  FilterSelectItemProps
>(function FilterSelectItem(props, ref) {
  return (
    <Ariakit.ComboboxItem ref={ref} className="select-item" {...props}>
      <Ariakit.ComboboxItemCheck />
      {props.children ?? props.value}
    </Ariakit.ComboboxItem>
  );
});
