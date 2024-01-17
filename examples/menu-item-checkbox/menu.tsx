import { forwardRef } from "react";
import type { ReactNode } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

interface MenuProps extends Ariakit.MenuButtonProps {
  label: ReactNode;
  values?: Ariakit.MenuStoreProps["values"];
  onValuesChange?: Ariakit.MenuStoreProps["setValues"];
  defaultValues?: Ariakit.MenuStoreProps["defaultValues"];
}

export const Menu = forwardRef<HTMLButtonElement, MenuProps>(function Menu(
  { label, values, onValuesChange, defaultValues, ...props },
  ref,
) {
  return (
    <Ariakit.MenuProvider
      values={values}
      setValues={onValuesChange}
      defaultValues={defaultValues}
    >
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        className={clsx("button", props.className)}
      >
        {label}
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu className="menu">
        <Ariakit.MenuArrow />
        {props.children}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
});

interface MenuItemCheckboxProps extends Ariakit.MenuItemCheckboxProps {}

export const MenuItemCheckbox = forwardRef<
  HTMLDivElement,
  MenuItemCheckboxProps
>(function MenuItemCheckbox(props, ref) {
  return (
    <Ariakit.MenuItemCheckbox
      ref={ref}
      {...props}
      className={clsx("menu-item", props.className)}
    >
      <Ariakit.MenuItemCheck /> {props.children}
    </Ariakit.MenuItemCheckbox>
  );
});
