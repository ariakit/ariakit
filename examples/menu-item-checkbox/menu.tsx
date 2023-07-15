import { forwardRef } from "react";
import type { ReactNode } from "react";
import * as Ariakit from "@ariakit/react";

interface MenuProps extends Omit<Ariakit.MenuButtonProps, "store"> {
  label: ReactNode;
  children?: ReactNode;
  defaultValues?: Ariakit.MenuStoreProps["defaultValues"];
  values?: Ariakit.MenuStoreProps["values"];
  onValuesChange?: Ariakit.MenuStoreProps["setValues"];
}

export const Menu = forwardRef<HTMLButtonElement, MenuProps>(function Menu(
  { label, defaultValues, values, onValuesChange, ...props },
  ref,
) {
  const menu = Ariakit.useMenuStore({
    defaultValues,
    values,
    setValues: onValuesChange,
  });
  return (
    <>
      <Ariakit.MenuButton ref={ref} className="button" {...props} store={menu}>
        {label}
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu store={menu} className="menu">
        <Ariakit.MenuArrow />
        {props.children}
      </Ariakit.Menu>
    </>
  );
});

interface MenuItemCheckboxProps extends Ariakit.MenuItemCheckboxProps {
  children: ReactNode;
}

export const MenuItemCheckbox = forwardRef<
  HTMLDivElement,
  MenuItemCheckboxProps
>(function MenuItemCheckbox(props, ref) {
  return (
    <Ariakit.MenuItemCheckbox ref={ref} className="menu-item" {...props}>
      <Ariakit.MenuItemCheck /> {props.children}
    </Ariakit.MenuItemCheckbox>
  );
});
