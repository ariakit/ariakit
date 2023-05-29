import { forwardRef } from "react";
import type { ReactNode } from "react";
import * as Ariakit from "@ariakit/react";

interface FilterMenuProps extends Omit<Ariakit.MenuButtonProps, "store"> {
  label: ReactNode;
  children?: ReactNode;
  defaultValues?: Ariakit.MenuStoreProps["defaultValues"];
  values?: Ariakit.MenuStoreProps["values"];
  onValuesChange?: Ariakit.MenuStoreProps["setValues"];
}

export const FilterMenu = forwardRef<HTMLButtonElement, FilterMenuProps>(
  function FilterMenu(
    { label, defaultValues, values, onValuesChange, ...props },
    ref
  ) {
    const menu = Ariakit.useMenuStore({
      defaultValues,
      values,
      setValues: onValuesChange,
    });
    return (
      <>
        <Ariakit.MenuButton
          ref={ref}
          className="button"
          {...props}
          store={menu}
        >
          {label}
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        <Ariakit.Menu store={menu} portal className="menu">
          {props.children}
        </Ariakit.Menu>
      </>
    );
  }
);

interface FilterMenuItemProps extends Ariakit.MenuItemCheckboxProps {
  children?: ReactNode;
}

export const FilterMenuItem = forwardRef<HTMLDivElement, FilterMenuItemProps>(
  function FilterMenuItem(props, ref) {
    return (
      <Ariakit.MenuItemCheckbox ref={ref} className="menu-item" {...props}>
        <Ariakit.MenuItemCheck /> {props.children ?? props.value}
      </Ariakit.MenuItemCheckbox>
    );
  }
);
