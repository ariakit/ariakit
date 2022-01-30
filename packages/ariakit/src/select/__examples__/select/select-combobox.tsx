import { ReactNode, forwardRef, useEffect } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxItemProps,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectItemProps,
  SelectLabel,
  SelectPopover,
  SelectProps,
  useSelectState,
} from "ariakit/select";

export type SelectComboboxProps = Omit<SelectProps, "state"> & {
  label: ReactNode;
  defaultValue?: string;
  defaultList?: string[];
  onFilter?: (matches: string[]) => void;
};

export const SelectCombobox = forwardRef<
  HTMLButtonElement,
  SelectComboboxProps
>(({ label, defaultValue, defaultList, onFilter, children, ...props }, ref) => {
  const select = useSelectState({ defaultValue, gutter: 4 });
  const combobox = useComboboxState({
    visible: true,
    activeId: select.activeId,
    setActiveId: select.setActiveId,
    defaultList,
  });

  useEffect(() => {
    onFilter?.(combobox.matches);
  }, [combobox.matches]);

  useEffect(() => {
    if (!select.mounted) {
      combobox.setValue("");
    }
  }, [select.mounted, combobox.setValue]);

  return (
    <>
      <SelectLabel state={select} className="label">
        {label}
      </SelectLabel>
      <Select state={select} ref={ref} {...props} className="select">
        {select.value}
        <SelectArrow />
      </Select>
      <SelectPopover
        portal
        state={select}
        composite={false}
        className="popover"
      >
        <Combobox
          state={combobox}
          className="combobox"
          placeholder="Search"
          autoSelect
        />
        <ComboboxList state={combobox} className="list">
          {children}
        </ComboboxList>
      </SelectPopover>
    </>
  );
});

export type SelectComboboxItemProps = SelectItemProps & ComboboxItemProps;

export const SelectComboboxItem = forwardRef<
  HTMLDivElement,
  SelectComboboxItemProps
>(({ children, focusOnHover = true, value, ...props }, ref) => {
  return (
    <SelectItem
      as={ComboboxItem}
      ref={ref}
      {...props}
      value={value}
      focusOnHover={focusOnHover}
    >
      <SelectItemCheck />
      {children || value}
    </SelectItem>
  );
});
