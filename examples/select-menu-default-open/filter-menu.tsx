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
          className="button secondary"
          {...props}
          store={menu}
        >
          {label}
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        <Ariakit.Menu store={menu} gutter={4} className="menu">
          {props.children}
        </Ariakit.Menu>
      </>
    );
  }
);

interface FilterMenuItemCheckboxProps extends Ariakit.MenuItemCheckboxProps {
  children?: ReactNode;
}

export const FilterMenuItemCheckbox = forwardRef<
  HTMLDivElement,
  FilterMenuItemCheckboxProps
>(function FilterMenuItemCheckbox(props, ref) {
  return (
    <Ariakit.MenuItemCheckbox
      ref={ref}
      hideOnClick
      className="menu-item"
      {...props}
    >
      <Ariakit.MenuItemCheck /> {props.children ?? props.value}
    </Ariakit.MenuItemCheckbox>
  );
});

export const FilterMenuItem = forwardRef<HTMLDivElement, Ariakit.MenuItemProps>(
  function FilterMenuItem(props, ref) {
    return <Ariakit.MenuItem ref={ref} className="menu-item" {...props} />;
  }
);

export const FilterMenuSeparator = forwardRef<
  HTMLHRElement,
  Ariakit.MenuSeparatorProps
>(function FilterMenuSeparator(props, ref) {
  return <Ariakit.MenuSeparator ref={ref} className="separator" {...props} />;
});
